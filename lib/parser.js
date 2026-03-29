const fs = require('fs');
const path = require('path');

function parseFAQs(filePath) {
  let rawText;
  try {
    rawText = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    console.error('Failed to read FAQ file:', err);
    return [];
  }

  const lines = rawText.split(/\r?\n/);
  const faqs = [];
  const seenQuestions = new Set();
  
  let currentQuestion = null;
  let currentAnswer = [];
  
  const finishPair = () => {
    if (currentQuestion && currentAnswer.length > 0) {
      const qText = currentQuestion.trim();
      const aText = currentAnswer.join('\n').trim();
      
      if (!seenQuestions.has(qText)) {
        seenQuestions.add(qText);
        faqs.push({ question: qText, answer: aText });
      }
    }
    currentQuestion = null;
    currentAnswer = [];
  };

  const isMetadata = (line) => {
    return line.startsWith('#') || 
           line.startsWith('==') || 
           line.startsWith('Source:') ||
           line.includes('Frequently Asked Questions') ||
           line.trim() === '';
  };
  
  let skipSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Check footer stop trigger
    if (trimmedLine === 'FAQs Categories') {
      skipSection = true; 
      finishPair();
      continue;
    }
    
    // Resume when another section header starts
    if (skipSection && trimmedLine.startsWith('## ')) {
      skipSection = false;
      continue;
    }

    if (skipSection || trimmedLine === '') {
      if (trimmedLine === '') {
        // A blank line signifies a boundary. 
        // If we have both question and answer started, maybe wait for next question to finish it?
        // Wait, the prompt says "a question line followed by its answer paragraph(s), separated by blank lines."
        // That implies:
        // [Blank Line]
        // Question
        // [Blank Line]
        // Answer P1
        // Answer P2
        // [Blank Line]
        // Question
      }
      continue;
    }
    
    if (isMetadata(trimmedLine)) continue;

    // Based on the text structure, Questions end with "?" 
    // BUT what if a question doesn't end with "?" ?
    // Let's observe the text. All questions end with "?" except maybe some?
    // "Question: How frequently are University fee rates revised?" (ends with "?")
    // Let's assume a question is any line that follows a blank line and the previous pair is finished OR if currentQuestion is null.
    // Actually, looking at the text, the answers can have empty lines between them? 
    // Example:
    // "Will there be hostel facility available for the MBBS students? "
    // "[Blank]"
    // "The facility will be available both for boys and girls..."
    // "[Blank]"
    // "For the details regarding hostel charges..."
    //
    // So answer paragraphs are separated by blank lines! 
    
    // If it's a question, it typically ends with '?'
    let isQuestion = trimmedLine.endsWith('?');
    
    if (isQuestion && currentAnswer.length > 0) {
      // We found a new question, so save the previous pair
      finishPair();
      currentQuestion = trimmedLine;
    } else if (isQuestion && !currentQuestion) {
      currentQuestion = trimmedLine;
    } else {
      // It's part of the answer
      // wait, what if the question doesn't end with "?" ?
      // If we don't have a question yet, and it doesn't end with '?', maybe it's still a question?
      if (!currentQuestion) {
        currentQuestion = trimmedLine;
      } else {
        currentAnswer.push(trimmedLine);
      }
    }
  }

  // End of file
  finishPair();

  return faqs;
}

module.exports = { parseFAQs };
