"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeResume = analyzeResume;
const readability_1 = require("@mozilla/readability");
const jsdom_1 = require("jsdom");
// Placeholder for common keywords (can be expanded and made dynamic)
const commonKeywords = [
    'javascript',
    'typescript',
    'react',
    'node.js',
    'express',
    'redux',
    'html',
    'css',
    'sql',
    'nosql',
    'aws',
    'azure',
    'docker',
    'kubernetes',
    'agile',
    'scrum',
    'project management',
    'data analysis',
    'machine learning',
    'python',
    'java',
    'c++',
];
// Placeholder for common action verbs
const actionVerbs = [
    'developed',
    'managed',
    'implemented',
    'created',
    'designed',
    'led',
    'optimized',
    'analyzed',
    'built',
    'collaborated',
    'coordinated',
    'delivered',
    'engineered',
    'facilitated',
    'generated',
    'improved',
    'initiated',
    'launched',
    'monitored',
    'navigated',
    'operated',
    'performed',
    'planned',
    'researched',
    'resolved',
    'streamlined',
    'supervised',
    'trained',
    'transformed',
    'upgraded',
];
const resumeSections = [
    'contact information',
    'summary',
    'objective',
    'experience',
    'education',
    'skills',
    'projects',
    'awards',
    'certifications',
    'publications',
    'volunteer experience',
];
function _checkSectionPresence(text) {
    const lowerText = text.toLowerCase();
    const foundSections = [];
    const missingSections = [];
    resumeSections.forEach((section) => {
        if (lowerText.includes(section)) {
            foundSections.push(section);
        }
        else {
            missingSections.push(section);
        }
    });
    return { found: foundSections, missing: missingSections };
}
function _analyzeKeywords(text) {
    const lowerText = text.toLowerCase();
    const matches = [];
    commonKeywords.forEach((keyword) => {
        if (lowerText.includes(keyword)) {
            matches.push(keyword);
        }
    });
    return matches;
}
function _analyzeActionVerbs(text) {
    const lowerText = text.toLowerCase();
    let count = 0;
    actionVerbs.forEach((verb) => {
        const regex = new RegExp(`\b${verb}\b`, 'g'); // Match whole word
        const matches = lowerText.match(regex);
        if (matches) {
            count += matches.length;
        }
    });
    return count;
}
function _analyzeQuantifiableAchievements(text) {
    // Simple regex to find numbers followed by common achievement indicators
    const regex = /\b(\d+(\.\d+)?)\s*(%|million|thousand|hundred|billion|dollars|increased|decreased|reduced|managed|saved|generated|boosted|expedited|improved|oversaw|achieved)\b/gi;
    const matches = text.match(regex);
    return matches ? matches.length : 0;
}
function _calculateReadability(text) {
    // Readability.js requires a DOM environment. We can simulate it with JSDOM.
    const dom = new jsdom_1.JSDOM(`<body>${text}</body>`);
    const reader = new readability_1.Readability(dom.window.document);
    const article = reader.parse();
    if (!article || !article.textContent) {
        return 0;
    }
    // A very simple heuristic: longer sentences and more complex words decrease readability.
    // Flesch-Kincaid Grade Level formula (simplified)
    const words = article.textContent.split(/\s+/).filter(Boolean);
    const sentences = article.textContent.split(/[.!?]\s*/).filter(Boolean);
    const syllables = words.reduce((acc, word) => acc + countSyllables(word), 0);
    if (sentences.length === 0 || words.length === 0) {
        return 0;
    }
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    // This is a simplified version and not a direct implementation of F-K.
    // Flesch-Kincaid: 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words)
    // Let's create a score where higher is better for simplicity, inverse of grade level.
    // A higher avgWordsPerSentence and avgSyllablesPerWord would typically mean lower readability.
    // So, we want to penalize those.
    const score = Math.max(0, 100 - avgWordsPerSentence * 2 - avgSyllablesPerWord * 15); // Heuristic
    return parseFloat(score.toFixed(2));
}
// Simple syllable counting heuristic
function countSyllables(word) {
    word = word.toLowerCase();
    if (word.length === 0)
        return 0;
    if (word.length <= 3)
        return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 0;
}
function analyzeResume(text) {
    let score = 0;
    const feedback = [];
    const sectionResults = _checkSectionPresence(text);
    const keywordMatches = _analyzeKeywords(text);
    const actionVerbCount = _analyzeActionVerbs(text);
    const quantifiableAchievementsCount = _analyzeQuantifiableAchievements(text);
    const readabilityScore = _calculateReadability(text);
    // Scoring Logic
    // Section Presence
    score += sectionResults.found.length * 5; // 5 points per found section
    if (sectionResults.missing.length > 0) {
        feedback.push(`Consider adding these sections: ${sectionResults.missing.join(', ')}.`);
    }
    // Keywords
    score += keywordMatches.length * 3; // 3 points per keyword match
    if (keywordMatches.length < 5) {
        feedback.push('Your resume could benefit from more relevant keywords.');
    }
    // Action Verbs
    score += Math.min(actionVerbCount, 30) * 1; // Max 30 points for action verbs
    if (actionVerbCount < 10) {
        feedback.push('Use more strong action verbs to describe your responsibilities and achievements.');
    }
    // Quantifiable Achievements
    score += Math.min(quantifiableAchievementsCount, 15) * 4; // Max 60 points for quantifiable achievements
    if (quantifiableAchievementsCount < 5) {
        feedback.push('Quantify your achievements with numbers and metrics to show impact.');
    }
    // Readability (scale to contribute to score)
    score += Math.min(Math.max(0, readabilityScore * 0.5), 15); // Max 15 points based on readability
    // Cap score at 100 and ensure it's not negative
    score = Math.min(100, Math.max(0, score));
    if (score < 50) {
        feedback.push('Your resume needs significant improvement. Focus on content and structure.');
    }
    else if (score < 75) {
        feedback.push('Good resume, but there is room for improvement. Review specific feedback.');
    }
    else {
        feedback.push('Excellent resume! Keep up the great work.');
    }
    return {
        score: parseFloat(score.toFixed(2)),
        feedback,
        details: {
            sectionsFound: sectionResults.found,
            missingSections: sectionResults.missing,
            keywordMatches,
            actionVerbCount,
            quantifiableAchievementsCount,
            readabilityScore,
        },
    };
}
