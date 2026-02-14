import type { Question, Topic, QuestionType, Difficulty, PhrasingFeatures } from '../types';
import { v4 as uuid } from 'uuid';

function pf(overrides: Partial<PhrasingFeatures> = {}): PhrasingFeatures {
  return {
    hasNegation: false,
    hasDoubleNegation: false,
    hasAbsoluteLanguage: false,
    hasQualifiedLanguage: false,
    sentenceComplexity: 'simple',
    vocabularyLevel: 'basic',
    keyTerms: [],
    ...overrides,
  };
}

function q(
  topic: Topic,
  type: QuestionType,
  difficulty: Difficulty,
  stem: string,
  correctAnswer: string,
  explanation: string,
  tags: string[],
  phrasingFeatures: PhrasingFeatures,
  choices?: string[],
  acceptableAnswers?: string[],
): Question {
  return {
    id: uuid(),
    topic,
    type,
    difficulty,
    stem,
    correctAnswer,
    explanation,
    tags,
    phrasingFeatures,
    choices,
    acceptableAnswers,
  };
}

export const questionBank: Question[] = [
  // ─── ALGEBRA ────────────────────────────────────────────
  q('algebra', 'multiple-choice', 'easy',
    'What is the value of x in the equation 2x + 6 = 14?',
    '4', 'Subtract 6 from both sides: 2x = 8, then divide by 2: x = 4.',
    ['linear-equations', 'solving'],
    pf({ keyTerms: ['equation', 'value'] }),
    ['2', '4', '6', '8']),

  q('algebra', 'multiple-choice', 'easy',
    'Simplify: 3(x + 2) - x',
    '2x + 6', 'Distribute: 3x + 6 - x = 2x + 6.',
    ['simplification', 'distribution'],
    pf({ keyTerms: ['simplify'] }),
    ['2x + 6', '3x + 2', '2x + 2', '4x + 6']),

  q('algebra', 'multiple-choice', 'medium',
    'Which of the following is NOT a solution to x² - 5x + 6 = 0?',
    '1', 'Factor: (x-2)(x-3)=0, so x=2 or x=3. 1 is not a solution.',
    ['quadratic', 'factoring'],
    pf({ hasNegation: true, keyTerms: ['solution', 'quadratic'] }),
    ['1', '2', '3', 'Both 2 and 3']),

  q('algebra', 'fill-in-the-blank', 'medium',
    'The slope of the line passing through points (1, 3) and (4, 9) is ___.',
    '2', 'Slope = (9-3)/(4-1) = 6/3 = 2.',
    ['slope', 'coordinate-geometry'],
    pf({ keyTerms: ['slope', 'line', 'points'] })),

  q('algebra', 'true-false', 'easy',
    'The expression x² + 4 can always be factored over the real numbers.',
    'False', 'x² + 4 has no real roots; its discriminant is negative. It cannot be factored over the reals.',
    ['factoring', 'quadratic'],
    pf({ hasAbsoluteLanguage: true, keyTerms: ['factored', 'real numbers'] })),

  q('algebra', 'multiple-choice', 'hard',
    'It is not uncommon for a quadratic equation with a negative discriminant to have no real solutions. Which discriminant value guarantees exactly one real solution?',
    '0', 'A discriminant of 0 means the quadratic has exactly one repeated real root.',
    ['quadratic', 'discriminant'],
    pf({ hasDoubleNegation: true, sentenceComplexity: 'complex', vocabularyLevel: 'advanced', keyTerms: ['discriminant', 'quadratic', 'real solutions'] }),
    ['0', '1', '-1', '4']),

  q('algebra', 'multiple-choice', 'medium',
    'If f(x) = 2x² - 3x + 1, what is f(-1)?',
    '6', 'f(-1) = 2(1) - 3(-1) + 1 = 2 + 3 + 1 = 6.',
    ['functions', 'evaluation'],
    pf({ keyTerms: ['function'] }),
    ['6', '0', '-4', '2']),

  q('algebra', 'short-answer', 'hard',
    'Describe what happens to the graph of y = a·x² as the value of a changes from positive to negative.',
    'The parabola flips from opening upward to opening downward.',
    'When a > 0 the parabola opens up; when a < 0 it opens down. The vertex remains on the y-axis if the equation is y = ax².',
    ['quadratic', 'graphing', 'transformations'],
    pf({ sentenceComplexity: 'complex', vocabularyLevel: 'intermediate', keyTerms: ['graph', 'parabola'] }),
    undefined,
    ['flips upside down', 'opens downward instead of upward', 'parabola inverts', 'reflects over the x-axis']),

  // ─── GEOMETRY ───────────────────────────────────────────
  q('geometry', 'multiple-choice', 'easy',
    'How many degrees are in a triangle?',
    '180', 'The interior angles of any triangle sum to 180°.',
    ['angles', 'triangle'],
    pf({ keyTerms: ['degrees', 'triangle'] }),
    ['90', '180', '270', '360']),

  q('geometry', 'multiple-choice', 'medium',
    'A circle has a radius of 5. What is its area?',
    '25π', 'Area = π·r² = π·25 = 25π.',
    ['circles', 'area'],
    pf({ keyTerms: ['circle', 'radius', 'area'] }),
    ['10π', '25π', '50π', '5π']),

  q('geometry', 'true-false', 'medium',
    'All rectangles are squares.',
    'False', 'All squares are rectangles, but not all rectangles are squares. A square requires all sides equal.',
    ['quadrilaterals', 'definitions'],
    pf({ hasAbsoluteLanguage: true, keyTerms: ['rectangles', 'squares'] })),

  q('geometry', 'fill-in-the-blank', 'hard',
    'The volume of a sphere with radius 3 is ___.',
    '36π', 'V = (4/3)πr³ = (4/3)π(27) = 36π.',
    ['sphere', 'volume', '3d-shapes'],
    pf({ vocabularyLevel: 'intermediate', keyTerms: ['volume', 'sphere', 'radius'] })),

  q('geometry', 'multiple-choice', 'hard',
    'In a right triangle, the hypotenuse is never shorter than either leg. If the legs are 5 and 12, the hypotenuse is:',
    '13', 'By the Pythagorean theorem: √(25+144) = √169 = 13.',
    ['pythagorean-theorem', 'right-triangle'],
    pf({ hasAbsoluteLanguage: true, sentenceComplexity: 'compound', keyTerms: ['hypotenuse', 'right triangle', 'legs'] }),
    ['13', '17', '11', '15']),

  q('geometry', 'multiple-choice', 'easy',
    'What is the perimeter of a square with side length 7?',
    '28', 'Perimeter = 4 × side = 4 × 7 = 28.',
    ['perimeter', 'square'],
    pf({ keyTerms: ['perimeter', 'square'] }),
    ['14', '21', '28', '49']),

  // ─── STATISTICS ─────────────────────────────────────────
  q('statistics', 'multiple-choice', 'easy',
    'What is the mean of the dataset: 2, 4, 6, 8, 10?',
    '6', 'Mean = (2+4+6+8+10)/5 = 30/5 = 6.',
    ['mean', 'central-tendency'],
    pf({ keyTerms: ['mean', 'dataset'] }),
    ['4', '5', '6', '8']),

  q('statistics', 'multiple-choice', 'medium',
    'The median of the dataset {3, 7, 1, 9, 5} is usually NOT the same as the mean. What is the median?',
    '5', 'Sorted: 1,3,5,7,9. The middle value is 5.',
    ['median', 'central-tendency'],
    pf({ hasNegation: true, hasQualifiedLanguage: true, keyTerms: ['median', 'mean', 'dataset'] }),
    ['3', '5', '7', '9']),

  q('statistics', 'true-false', 'medium',
    'A standard deviation of 0 means all values in the dataset are identical.',
    'True', 'If every value equals the mean, all deviations are 0, so the standard deviation is 0.',
    ['standard-deviation', 'variability'],
    pf({ vocabularyLevel: 'intermediate', keyTerms: ['standard deviation'] })),

  q('statistics', 'fill-in-the-blank', 'hard',
    'In a normal distribution, approximately ___% of data falls within one standard deviation of the mean.',
    '68', 'The 68-95-99.7 rule states ~68% is within 1 SD.',
    ['normal-distribution', 'empirical-rule'],
    pf({ vocabularyLevel: 'advanced', keyTerms: ['normal distribution', 'standard deviation'] })),

  q('statistics', 'multiple-choice', 'hard',
    'A p-value of 0.03 sometimes suggests that the null hypothesis should be rejected at the α = 0.05 level. Is this interpretation generally correct?',
    'Yes', 'Since 0.03 < 0.05, we reject the null hypothesis at the 5% significance level.',
    ['hypothesis-testing', 'p-value'],
    pf({ hasQualifiedLanguage: true, sentenceComplexity: 'complex', vocabularyLevel: 'advanced', keyTerms: ['p-value', 'null hypothesis', 'significance'] }),
    ['Yes', 'No', 'Only with large samples', 'Cannot determine']),

  // ─── CALCULUS ───────────────────────────────────────────
  q('calculus', 'multiple-choice', 'easy',
    'What is the derivative of f(x) = 3x²?',
    '6x', 'Using the power rule: d/dx[3x²] = 6x.',
    ['derivatives', 'power-rule'],
    pf({ keyTerms: ['derivative'] }),
    ['3x', '6x', '6x²', '3']),

  q('calculus', 'fill-in-the-blank', 'medium',
    'The integral of 2x with respect to x is ___ + C.',
    'x²', '∫2x dx = x² + C.',
    ['integrals', 'power-rule'],
    pf({ keyTerms: ['integral'] })),

  q('calculus', 'true-false', 'medium',
    'The derivative of a constant is always zero.',
    'True', 'Constants have no rate of change, so their derivative is 0.',
    ['derivatives', 'constants'],
    pf({ hasAbsoluteLanguage: true, keyTerms: ['derivative', 'constant'] })),

  q('calculus', 'multiple-choice', 'hard',
    'Which of the following does NOT represent an application of the chain rule?',
    'd/dx[5x + 3]', 'The chain rule applies to compositions of functions. 5x+3 is a simple linear function—no composition needed.',
    ['chain-rule', 'derivatives'],
    pf({ hasNegation: true, vocabularyLevel: 'advanced', keyTerms: ['chain rule'] }),
    ['d/dx[sin(x²)]', 'd/dx[(3x+1)⁴]', 'd/dx[5x + 3]', 'd/dx[e^(2x)]']),

  q('calculus', 'multiple-choice', 'hard',
    'The limit of (sin x)/x as x approaches 0 is:',
    '1', 'This is a fundamental limit in calculus, proven via the squeeze theorem.',
    ['limits', 'trigonometric'],
    pf({ vocabularyLevel: 'advanced', keyTerms: ['limit', 'approaches'] }),
    ['0', '1', '∞', 'undefined']),

  // ─── BIOLOGY ────────────────────────────────────────────
  q('biology', 'multiple-choice', 'easy',
    'What organelle is known as the "powerhouse of the cell"?',
    'Mitochondria', 'Mitochondria perform cellular respiration to produce ATP.',
    ['cell-biology', 'organelles'],
    pf({ keyTerms: ['organelle', 'cell'] }),
    ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi apparatus']),

  q('biology', 'true-false', 'easy',
    'DNA stands for deoxyribonucleic acid.',
    'True', 'DNA is short for deoxyribonucleic acid.',
    ['genetics', 'dna'],
    pf({ keyTerms: ['DNA'] })),

  q('biology', 'multiple-choice', 'medium',
    'Which process does NOT occur during mitosis?',
    'Reduction of chromosome number', 'Chromosome number is reduced during meiosis, not mitosis.',
    ['cell-division', 'mitosis'],
    pf({ hasNegation: true, keyTerms: ['mitosis'] }),
    ['Prophase', 'Cytokinesis', 'Reduction of chromosome number', 'Metaphase']),

  q('biology', 'fill-in-the-blank', 'medium',
    'Photosynthesis primarily takes place in the ___ of plant cells.',
    'chloroplasts', 'Chloroplasts contain chlorophyll and are the site of photosynthesis.',
    ['photosynthesis', 'cell-biology'],
    pf({ keyTerms: ['photosynthesis', 'plant cells'] }),
    undefined,
    ['chloroplast']),

  q('biology', 'multiple-choice', 'hard',
    'It is not impossible for a recessive allele to be expressed in a heterozygous individual under certain conditions. This phenomenon is best described as:',
    'Incomplete dominance', 'Incomplete dominance occurs when the heterozygote shows a phenotype intermediate between the two homozygotes, partially expressing the recessive allele.',
    ['genetics', 'dominance'],
    pf({ hasDoubleNegation: true, sentenceComplexity: 'complex', vocabularyLevel: 'advanced', keyTerms: ['recessive allele', 'heterozygous', 'dominance'] }),
    ['Codominance', 'Incomplete dominance', 'Epistasis', 'Pleiotropy']),

  q('biology', 'short-answer', 'medium',
    'Explain the difference between mitosis and meiosis.',
    'Mitosis produces two identical diploid cells; meiosis produces four genetically unique haploid cells.',
    'Mitosis is for growth/repair and maintains chromosome number. Meiosis is for gamete production and halves the chromosome number, introducing genetic variation through crossing over.',
    ['cell-division', 'mitosis', 'meiosis'],
    pf({ sentenceComplexity: 'simple', vocabularyLevel: 'intermediate', keyTerms: ['mitosis', 'meiosis'] }),
    undefined,
    ['mitosis makes 2 identical cells, meiosis makes 4 different cells', 'mitosis is for body cells, meiosis for sex cells']),

  // ─── CHEMISTRY ──────────────────────────────────────────
  q('chemistry', 'multiple-choice', 'easy',
    'What is the chemical symbol for water?',
    'H₂O', 'Water consists of 2 hydrogen atoms and 1 oxygen atom.',
    ['chemical-formulas', 'basics'],
    pf({ keyTerms: ['chemical symbol', 'water'] }),
    ['H₂O', 'CO₂', 'NaCl', 'O₂']),

  q('chemistry', 'true-false', 'medium',
    'All acids always have a pH less than 7.',
    'True', 'By definition, acids have a pH below 7 in aqueous solution.',
    ['acids-bases', 'pH'],
    pf({ hasAbsoluteLanguage: true, keyTerms: ['acids', 'pH'] })),

  q('chemistry', 'multiple-choice', 'medium',
    'Which type of bond involves the sharing of electrons between atoms?',
    'Covalent bond', 'Covalent bonds form when atoms share electron pairs.',
    ['bonding', 'covalent'],
    pf({ keyTerms: ['bond', 'sharing', 'electrons'] }),
    ['Ionic bond', 'Covalent bond', 'Metallic bond', 'Hydrogen bond']),

  q('chemistry', 'fill-in-the-blank', 'hard',
    'Avogadro\'s number is approximately ___ × 10²³.',
    '6.022', 'Avogadro\'s number ≈ 6.022 × 10²³ particles per mole.',
    ['moles', 'avogadro'],
    pf({ vocabularyLevel: 'advanced', keyTerms: ["Avogadro's number"] }),
    undefined,
    ['6.02', '6']),

  q('chemistry', 'multiple-choice', 'hard',
    'In an exothermic reaction, it is never the case that the products have more energy than the reactants. The enthalpy change (ΔH) is:',
    'Negative', 'Exothermic reactions release energy, so ΔH < 0.',
    ['thermochemistry', 'enthalpy'],
    pf({ hasNegation: true, hasAbsoluteLanguage: true, sentenceComplexity: 'complex', vocabularyLevel: 'advanced', keyTerms: ['exothermic', 'enthalpy', 'ΔH'] }),
    ['Positive', 'Negative', 'Zero', 'Cannot determine']),

  // ─── PHYSICS ────────────────────────────────────────────
  q('physics', 'multiple-choice', 'easy',
    'What is the SI unit of force?',
    'Newton', 'The SI unit of force is the Newton (N).',
    ['forces', 'units'],
    pf({ keyTerms: ['SI unit', 'force'] }),
    ['Joule', 'Newton', 'Watt', 'Pascal']),

  q('physics', 'true-false', 'easy',
    'An object at rest will always remain at rest unless acted upon by an external force.',
    'True', "This is Newton's first law of motion (law of inertia).",
    ['newtons-laws', 'inertia'],
    pf({ hasAbsoluteLanguage: true, keyTerms: ['object at rest', 'external force'] })),

  q('physics', 'multiple-choice', 'medium',
    'If an object is thrown upward, at the highest point its velocity is:',
    '0 m/s', 'At the apex, the object momentarily has zero velocity before falling back down.',
    ['kinematics', 'projectile-motion'],
    pf({ keyTerms: ['velocity', 'highest point'] }),
    ['0 m/s', '9.8 m/s', '-9.8 m/s', 'Maximum']),

  q('physics', 'fill-in-the-blank', 'medium',
    'The acceleration due to gravity on Earth is approximately ___ m/s².',
    '9.8', 'Standard gravity ≈ 9.8 m/s² (or 9.81 m/s²).',
    ['gravity', 'constants'],
    pf({ keyTerms: ['acceleration', 'gravity'] }),
    undefined,
    ['9.81', '9.80', '10']),

  q('physics', 'multiple-choice', 'hard',
    'According to the equation E = mc², which of the following is NOT implied?',
    'Energy can be created from nothing', 'E=mc² shows mass-energy equivalence; energy is converted, not created from nothing.',
    ['relativity', 'energy'],
    pf({ hasNegation: true, vocabularyLevel: 'advanced', keyTerms: ['E = mc²', 'energy', 'mass'] }),
    ['Mass can be converted to energy', 'Energy can be created from nothing', 'A small mass yields large energy', 'c is the speed of light']),

  q('physics', 'short-answer', 'hard',
    'Explain why heavier and lighter objects fall at the same rate in a vacuum.',
    'In a vacuum there is no air resistance, and gravitational acceleration is independent of mass.',
    'Gravitational force is F=mg, and acceleration a=F/m=g. The mass cancels out, so all objects experience the same gravitational acceleration regardless of mass. Air resistance is the only thing that causes different fall rates in practice.',
    ['gravity', 'free-fall'],
    pf({ sentenceComplexity: 'compound', vocabularyLevel: 'intermediate', keyTerms: ['vacuum', 'fall', 'rate'] }),
    undefined,
    ['gravity accelerates all objects equally', 'no air resistance in vacuum', 'acceleration due to gravity is the same for all masses']),

  // ─── HISTORY ────────────────────────────────────────────
  q('history', 'multiple-choice', 'easy',
    'In what year did World War II end?',
    '1945', 'World War II ended in 1945 with the surrender of Germany and Japan.',
    ['world-war-2', 'dates'],
    pf({ keyTerms: ['World War II'] }),
    ['1943', '1944', '1945', '1946']),

  q('history', 'true-false', 'easy',
    'The Declaration of Independence was signed in 1776.',
    'True', 'The Declaration of Independence was adopted on July 4, 1776.',
    ['american-revolution', 'dates'],
    pf({ keyTerms: ['Declaration of Independence'] })),

  q('history', 'multiple-choice', 'medium',
    'Which civilization is NOT generally considered one of the earliest river valley civilizations?',
    'Roman', 'The earliest river valley civilizations were Mesopotamia, Egypt, Indus Valley, and China. Rome came later.',
    ['ancient-civilizations'],
    pf({ hasNegation: true, hasQualifiedLanguage: true, keyTerms: ['river valley civilizations'] }),
    ['Mesopotamian', 'Egyptian', 'Roman', 'Indus Valley']),

  q('history', 'fill-in-the-blank', 'medium',
    'The Berlin Wall fell in the year ___.',
    '1989', 'The Berlin Wall fell on November 9, 1989.',
    ['cold-war', 'dates'],
    pf({ keyTerms: ['Berlin Wall'] })),

  q('history', 'multiple-choice', 'hard',
    'The causes of World War I are sometimes debated, but which of the following is usually NOT cited as a primary cause?',
    'The discovery of penicillin', 'Militarism, alliances, imperialism, and nationalism (MAIN) are the primary causes. Penicillin was discovered in 1928.',
    ['world-war-1', 'causes'],
    pf({ hasQualifiedLanguage: true, hasNegation: true, sentenceComplexity: 'complex', keyTerms: ['World War I', 'causes'] }),
    ['Militarism', 'Alliance systems', 'The discovery of penicillin', 'Nationalism']),

  // ─── LITERATURE ─────────────────────────────────────────
  q('literature', 'multiple-choice', 'easy',
    'Who wrote "Romeo and Juliet"?',
    'William Shakespeare', 'Romeo and Juliet is a tragedy written by William Shakespeare.',
    ['shakespeare', 'plays'],
    pf({ keyTerms: ['Romeo and Juliet'] }),
    ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain']),

  q('literature', 'true-false', 'medium',
    'A sonnet always contains exactly 14 lines.',
    'True', 'By definition, a sonnet is a 14-line poem, typically in iambic pentameter.',
    ['poetry', 'forms'],
    pf({ hasAbsoluteLanguage: true, keyTerms: ['sonnet'] })),

  q('literature', 'multiple-choice', 'medium',
    'Which literary device involves giving human qualities to non-human things?',
    'Personification', 'Personification attributes human characteristics to animals, objects, or ideas.',
    ['literary-devices'],
    pf({ keyTerms: ['literary device', 'human qualities'] }),
    ['Metaphor', 'Simile', 'Personification', 'Alliteration']),

  q('literature', 'fill-in-the-blank', 'hard',
    'The narrative perspective in which the narrator knows the thoughts of all characters is called ___ point of view.',
    'omniscient', 'Third-person omniscient narrators can access the inner thoughts of every character.',
    ['narrative', 'point-of-view'],
    pf({ vocabularyLevel: 'advanced', keyTerms: ['narrative perspective', 'narrator'] }),
    undefined,
    ['third-person omniscient', 'third person omniscient']),

  q('literature', 'multiple-choice', 'hard',
    'It is not entirely inaccurate to say that the "unreliable narrator" technique was popularized in the 20th century. Which of the following novels is best known for this device?',
    'The Catcher in the Rye', 'Holden Caulfield is one of the most famous unreliable narrators in literature.',
    ['narrative-techniques', 'novels'],
    pf({ hasDoubleNegation: true, sentenceComplexity: 'complex', vocabularyLevel: 'advanced', keyTerms: ['unreliable narrator'] }),
    ['The Catcher in the Rye', 'Pride and Prejudice', '1984', 'To Kill a Mockingbird']),

  // ─── GRAMMAR ────────────────────────────────────────────
  q('grammar', 'multiple-choice', 'easy',
    'Which of the following is a complete sentence?',
    'The cat sat on the mat.', 'A complete sentence has a subject and a predicate.',
    ['sentence-structure', 'basics'],
    pf({ keyTerms: ['complete sentence'] }),
    ['Running quickly.', 'The cat sat on the mat.', 'Because it rained.', 'Very tall and strong.']),

  q('grammar', 'true-false', 'easy',
    'A noun is a word that describes an action.',
    'False', 'A noun names a person, place, thing, or idea. Verbs describe actions.',
    ['parts-of-speech', 'nouns'],
    pf({ keyTerms: ['noun', 'action'] })),

  q('grammar', 'multiple-choice', 'medium',
    'Which sentence uses the correct form of "their/there/they\'re"?',
    "They're going to the park.", "'They're' is a contraction of 'they are.'",
    ['homophones', 'usage'],
    pf({ keyTerms: ['their', 'there', "they're"] }),
    ["Their going to the park.", "They're going to the park.", "There going to the park.", "Thier going to the park."]),

  q('grammar', 'fill-in-the-blank', 'medium',
    'The past tense of "run" is ___.',
    'ran', '"Run" is an irregular verb; its past tense is "ran."',
    ['verb-tenses', 'irregular-verbs'],
    pf({ keyTerms: ['past tense'] })),

  q('grammar', 'multiple-choice', 'hard',
    'In the sentence "The committee, which had been deliberating for hours, has finally reached a decision," the subject-verb agreement is:',
    'Correct, because "committee" is a collective noun treated as singular', 'Collective nouns like "committee" take singular verbs when acting as one unit.',
    ['subject-verb-agreement', 'collective-nouns'],
    pf({ sentenceComplexity: 'complex', vocabularyLevel: 'advanced', keyTerms: ['subject-verb agreement', 'collective noun'] }),
    [
      'Correct, because "committee" is a collective noun treated as singular',
      'Incorrect, it should be "have"',
      'Correct, because of the word "which"',
      'Incorrect, "deliberating" should be "deliberated"'
    ]),

  q('grammar', 'multiple-choice', 'hard',
    'Which sentence does NOT contain a dangling modifier?',
    'After finishing the assignment, Maria went for a walk.',
    'A dangling modifier lacks a clear subject. "After finishing the assignment, Maria…" correctly attaches the modifier to Maria.',
    ['modifiers', 'sentence-structure'],
    pf({ hasNegation: true, vocabularyLevel: 'advanced', keyTerms: ['dangling modifier'] }),
    [
      'Walking to school, the rain started.',
      'After finishing the assignment, Maria went for a walk.',
      'Covered in mud, the dog was a sight to behold by running.',
      'Hoping for the best, the exam was taken.'
    ]),
];

// Index for quick lookups
export function getQuestionsByTopic(topic: Topic): Question[] {
  return questionBank.filter(q => q.topic === topic);
}

export function getQuestionsByType(type: QuestionType): Question[] {
  return questionBank.filter(q => q.type === type);
}

export function getQuestionsByDifficulty(difficulty: Difficulty): Question[] {
  return questionBank.filter(q => q.difficulty === difficulty);
}

export function getQuestionsByTopicAndType(topic: Topic, type: QuestionType): Question[] {
  return questionBank.filter(q => q.topic === topic && q.type === type);
}
