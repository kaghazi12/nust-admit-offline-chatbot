const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'can', 'i', 'my', 'for', 'of', 'in', 'to', 'do', 'be', 'have',
  'will', 'what', 'how', 'when', 'where', 'who', 'which', 'does', 'if', 'on', 'at', 'with', 'about'
]);

function tokenize(text) {
  const tokens = text.toLowerCase().split(/[\s,.\-?!()\/]+/);
  return tokens.filter(t => t.length > 0 && !STOP_WORDS.has(t));
}

function searchFAQs(query, faqs) {
  const queryLower = query.toLowerCase().trim();
  const queryTokens = tokenize(queryLower);
  
  if (queryTokens.length === 0) return null;

  let bestMatch = null;
  let highestScore = 0;

  for (const faq of faqs) {
    const qText = faq.question.toLowerCase();
    const aText = faq.answer.toLowerCase();
    
    const qTokens = tokenize(qText);
    const aTokens = tokenize(aText);
    
    let score = 0;
    
    // 1. Exact Phrase Multiplier Math Boost
    if (queryLower.length > 5 && qText.includes(queryLower)) {
      score += 25; // Massive boost for exact phrase in Question
    } else if (queryLower.length > 5 && aText.includes(queryLower)) {
      score += 10; // Moderate boost for exact phrase in Answer
    }

    // 2. Token-by-Token Match with Partial-Word Stem Scoring
    for (const qt of queryTokens) {
      const weight = qt.length; // Priority to longer, complex keywords

      // Pseudo-stemming: Is the query word inside a question token or vice versa? 
      // (Length check prevents tiny substrings like 'is' matching everything)
      const isQMatch = qTokens.some(t => t === qt || (qt.length > 3 && t.includes(qt)) || (t.length > 3 && qt.includes(t)));
      
      if (isQMatch) {
        score += (weight * 3); // 3x Multiplier for landing in the Question title
        continue; // Already scored this concept heavily, skip answer check
      }

      // 3. Fallback scan inside the Answer body
      const isAMatch = aTokens.some(t => t === qt || (qt.length > 3 && t.includes(qt)) || (t.length > 3 && qt.includes(t)));
      if (isAMatch) {
        score += weight; // 1x Multiplier for finding the concept explained in the Answer body
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = faq;
    }
  }

  // Define a reasonable minimum score threshold so it doesn't return garbage 
  // if you type completely irrelevant letters that partially match a huge word
  if (highestScore < 3) {
    return null;
  }

  return bestMatch;
}

module.exports = { searchFAQs };
