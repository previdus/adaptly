type Concept = {
  name: string;
  levels: readonly [string, string, string];
};

export const curriculumTopics = [
  {
    id: 'odd-even', name: 'Odd & even numbers', subject: 'maths', icon: '🔢',
    prerequisite: 'Count whole numbers and form equal pairs.', ageBand: 'Foundation',
    concepts: [
      {name:'Recognize parity', levels:['Pair numbers up to 20','Use the last digit up to 100','Classify larger whole numbers']},
      {name:'Parity of sums', levels:['Add two even numbers','Combine odd and even numbers','Add two odd numbers']},
      {name:'Parity of products', levels:['Multiply by two','Predict odd times odd','Predict mixed-parity products']}
    ]
  },
  {
    id:'negative-numbers', name:'Negative numbers', subject:'maths', icon:'🌡️',
    prerequisite:'Order positive whole numbers and subtract.', ageBand:'Developing',
    concepts:[
      {name:'Order signed numbers',levels:['Compare a negative number with zero','Compare two negative numbers','Find distance from zero']},
      {name:'Move on a number line',levels:['Add within the negative side','Add across zero','Subtract across zero']},
      {name:'Signed-number stories',levels:['Temperature rises','Temperature falls','Work out a temperature change']}
    ]
  },
  {
    id:'roman-numerals', name:'Roman numerals', subject:'maths', icon:'🏛️',
    prerequisite:'Read whole numbers and understand addition.', ageBand:'Developing',
    concepts:[
      {name:'Read Roman symbols',levels:['Read additive I, V and X forms','Introduce subtractive forms up to C','Read hundreds up to M']},
      {name:'Write Roman numerals',levels:['Write numbers up to 20','Use subtractive forms up to 100','Combine hundreds, tens and ones']},
      {name:'Reason with Roman numbers',levels:['Add small Roman numbers','Subtract Roman numbers','Find a missing Roman amount']}
    ]
  },
  {
    id:'factors-multiples', name:'Factors & multiples', subject:'maths', icon:'🧮',
    prerequisite:'Know multiplication facts and exact division.', ageBand:'Developing',
    concepts:[
      {name:'Factor pairs',levels:['Complete small factor pairs','Find a missing factor','Check whether a number is a factor']},
      {name:'Multiples',levels:['Find the next multiple','Find an indexed multiple','Find a missing multiplier']},
      {name:'Common relationships',levels:['Recognize a common factor','Recognize a common multiple','Count factors systematically']}
    ]
  },
  {
    id:'prime-numbers', name:'Prime & composite numbers', subject:'maths', icon:'🔎',
    prerequisite:'Recognize factors and multiply whole numbers.', ageBand:'Developing',
    concepts:[
      {name:'Classify numbers',levels:['Prime or composite up to 20','Prime or composite up to 100','Prime or composite up to 300']},
      {name:'Prime factors',levels:['Prime factors of two-factor products','Recognize a prime divisor','Count prime factors with repetition']},
      {name:'Prime reasoning',levels:['Find the next prime','Find a prime between bounds','Use a repeated prime factor']}
    ]
  },
  {
    id:'divisibility', name:'Divisibility rules', subject:'maths', icon:'🗝️',
    prerequisite:'Recognize ones digits and add small digits.', ageBand:'Developing',
    concepts:[
      {name:'Last-digit rules',levels:['Test divisibility by 2','Test divisibility by 5','Test divisibility by 10']},
      {name:'Digit-sum rules',levels:['Test divisibility by 3','Test divisibility by 9','Complete a digit-sum multiple']},
      {name:'Combine rules',levels:['Test divisibility by 6','Test divisibility by 4','Test divisibility by 12']}
    ]
  },
  {
    id:'order-operations', name:'Order of operations', subject:'maths', icon:'🪜',
    prerequisite:'Add, subtract, multiply and divide.', ageBand:'Developing',
    concepts:[
      {name:'Multiply before adding',levels:['One product and one sum','One product and one difference','Two products in one expression']},
      {name:'Brackets first',levels:['Add inside brackets','Subtract inside brackets','Combine brackets with a second operation']},
      {name:'Equal-priority operations',levels:['Multiply and divide left to right','Add and subtract left to right','Combine a division, product and sum']}
    ]
  },
  {
    id:'mental-maths', name:'Mental maths strategies', subject:'maths', icon:'⚡',
    prerequisite:'Know basic addition and multiplication facts.', ageBand:'Developing',
    concepts:[
      {name:'Bridge a friendly number',levels:['Add by making ten','Add near a hundred','Subtract a near multiple of ten']},
      {name:'Double and halve',levels:['Double two-digit numbers','Halve even numbers','Halve before multiplying']},
      {name:'Compensate',levels:['Multiply by 9 as 10 minus 1','Multiply by 11 as 10 plus 1','Multiply by 99 as 100 minus 1']}
    ]
  },
  {
    id:'advanced-fractions', name:'Mixed & unlike fractions', subject:'maths', icon:'🥧',
    prerequisite:'Understand equivalent fractions and like-denominator sums.', ageBand:'Later challenge',
    concepts:[
      {name:'Improper and mixed numbers',levels:['Find whole parts in an improper fraction','Find the remaining fractional part','Convert a mixed number to an improper fraction']},
      {name:'Unlike denominators',levels:['Add when one denominator is a multiple','Add with a shared multiple','Subtract using a shared denominator']},
      {name:'Multiply fractions',levels:['Multiply a fraction by a whole number','Multiply two proper fractions','Simplify a fraction product']},
      {name:'Divide fractions',levels:['Divide by a unit fraction','Divide a fraction by a whole number','Divide two fractions using the reciprocal']}
    ]
  },
  {
    id:'advanced-decimals', name:'Decimal multiplication & division', subject:'maths', icon:'🔬',
    prerequisite:'Read decimals and multiply or divide whole numbers.', ageBand:'Later challenge',
    concepts:[
      {name:'Multiply decimals',levels:['Tenths times a whole number','Hundredths times a whole number','Tenths times tenths']},
      {name:'Divide decimals',levels:['Decimal divided by a whole number','Divide by a decimal','Scale both numbers to divide']},
      {name:'Recurring decimals',levels:['Identify repeating thirds','Identify repeating ninths','Distinguish terminating and recurring decimals']}
    ]
  },
  {
    id:'lines', name:'Lines & relationships', subject:'maths', icon:'📏',
    prerequisite:'Recognize straight lines and right angles.', ageBand:'Foundation',
    concepts:[
      {name:'Identify line relationships',levels:['Equal-height horizontal lines are parallel','Horizontal and vertical lines are perpendicular','Classify lines from their descriptions']},
      {name:'Reason about parallel lines',levels:['Count parallel sides of rectangles','Identify parallel lines on a grid','Keep direction when extending lines']},
      {name:'Reason about perpendicular lines',levels:['Recognize a quarter turn','Find the angle at a perpendicular crossing','Find a complementary turn']}
    ]
  },
  {
    id:'symmetry', name:'Symmetry', subject:'maths', icon:'🦋',
    prerequisite:'Recognize basic shapes and coordinates on a grid.', ageBand:'Developing',
    concepts:[
      {name:'Lines of symmetry',levels:['Recognize symmetry of familiar shapes','Count regular-polygon symmetry lines','Distinguish line and rotational symmetry']},
      {name:'Mirror coordinates',levels:['Reflect across a vertical line','Reflect across a horizontal line','Reflect across a displaced vertical line']},
      {name:'Rotational symmetry',levels:['Find the order for regular polygons','Find the smallest rotation','Compare half-turn and quarter-turn symmetry']}
    ]
  },
  {
    id:'coordinates', name:'Coordinates', subject:'maths', icon:'🗺️',
    prerequisite:'Read horizontal and vertical axes.', ageBand:'Developing',
    concepts:[
      {name:'Read ordered pairs',levels:['Read the x coordinate','Read the y coordinate','Write the whole ordered pair']},
      {name:'Move on a grid',levels:['Move horizontally','Move vertically','Combine horizontal and vertical moves']},
      {name:'Reason about positions',levels:['Find horizontal distance','Find vertical distance','Locate a midpoint with whole coordinates']}
    ]
  },
  {
    id:'transformations', name:'Transformations', subject:'maths', icon:'🔄',
    prerequisite:'Read signed coordinates and understand symmetry.', ageBand:'Later challenge',
    concepts:[
      {name:'Translations',levels:['Translate to the right','Translate upwards','Translate in two signed directions']},
      {name:'Reflections',levels:['Reflect across the y axis','Reflect across the x axis','Reflect across the line y equals x']},
      {name:'Rotations',levels:['Rotate a half-turn about the origin','Rotate a quarter-turn anticlockwise','Rotate a quarter-turn clockwise']}
    ]
  },
  {
    id:'mixed-units', name:'Mixed-unit problems', subject:'maths', icon:'📦',
    prerequisite:'Convert between metric units.', ageBand:'Developing',
    concepts:[
      {name:'Combine lengths',levels:['Add metres and centimetres','Subtract from a whole metre amount','Convert a mixed length to decimal metres']},
      {name:'Combine masses',levels:['Add kilograms and grams','Subtract a mixed mass','Read grams as decimal kilograms']},
      {name:'Combine capacities',levels:['Add litres and millilitres','Subtract a mixed capacity','Read millilitres as decimal litres']}
    ]
  },
  {
    id:'temperature', name:'Temperature', subject:'maths', icon:'🌡️',
    prerequisite:'Compare signed whole numbers.', ageBand:'Developing',
    concepts:[
      {name:'Read temperature relationships',levels:['Find the warmer positive temperature','Find the warmer negative temperature','Compare across zero']},
      {name:'Temperature changes',levels:['Rise from a positive temperature','Rise across freezing','Fall across freezing']},
      {name:'Temperature differences',levels:['Difference above zero','Difference below zero','Difference across zero']}
    ]
  },
  {
    id:'scale-drawings', name:'Scale drawings', subject:'maths', icon:'🗺️',
    prerequisite:'Understand ratio and metric conversions.', ageBand:'Later challenge',
    concepts:[
      {name:'Scale up a length',levels:['Use one centimetre per metre','Use one centimetre per several metres','Read a numerical scale ratio']},
      {name:'Scale down a length',levels:['Real metres to drawing centimetres','Use a larger scale factor','Convert units before scaling']},
      {name:'Scale and shape',levels:['Scale both sides of a rectangle','Find a scaled perimeter','Find area from scaled lengths']}
    ]
  },
  {
    id:'algebra', name:'Expressions, equations & inequalities', subject:'maths', icon:'🔤',
    prerequisite:'Use order of operations and inverse operations.', ageBand:'Later challenge',
    concepts:[
      {name:'Read expressions',levels:['Translate a repeated quantity','Translate a sum of a multiple and a constant','Translate a difference from a multiple']},
      {name:'Substitution',levels:['Substitute into a sum','Substitute into a product plus a constant','Substitute into a squared expression']},
      {name:'Solve equations',levels:['Undo addition','Undo multiplication','Undo two operations']},
      {name:'Inequalities',levels:['Compare an expression with a bound','Find a greatest allowed whole number','Find a least allowed whole number']}
    ]
  },
  {
    id:'advanced-data', name:'Graphs & data summaries', subject:'maths', icon:'📈',
    prerequisite:'Read tables and calculate a mean.', ageBand:'Later challenge',
    concepts:[
      {name:'Line-graph values',levels:['Read a labelled point','Find a change between points','Calculate a total from points']},
      {name:'Pie-chart shares',levels:['Convert a half or quarter to an angle','Convert a fraction to a sector angle','Read a percentage sector']},
      {name:'Median',levels:['Middle of an ordered odd list','Sort before finding the middle','Average two middle values']},
      {name:'Mode and range',levels:['Identify the most frequent value','Find the range','Separate frequency from size']}
    ]
  },
  {
    id:'financial-maths', name:'Tax, bills & compound interest', subject:'maths', icon:'🧾',
    prerequisite:'Calculate percentages and unit prices.', ageBand:'Later challenge',
    concepts:[
      {name:'Tax',levels:['Find tax on one price','Add tax to a bill','Tax a discounted price']},
      {name:'Bills',levels:['Add item costs','Apply a fixed fee','Apply a percentage service charge']},
      {name:'Best buys',levels:['Compare unit prices','Choose a cheaper equal quantity','Find savings on a target quantity']},
      {name:'Compound interest',levels:['One period of growth','Two periods of compound growth','Compare simple and compound interest']}
    ]
  },
  {
    id:'reasoning', name:'Multi-step mathematical reasoning', subject:'maths', icon:'🧠',
    prerequisite:'Select arithmetic operations from word problems.', ageBand:'Developing',
    concepts:[
      {name:'Plan two steps',levels:['Multiply then add','Multiply then subtract','Subtract then divide']},
      {name:'Estimate and check',levels:['Round to the nearest ten','Estimate a sum','Estimate a product']},
      {name:'Find an error',levels:['Identify an incorrect addition','Identify an order-of-operations error','Identify a unit-conversion error']}
    ]
  },
  {
    id:'english-articles', name:'Articles', subject:'english', icon:'📝',
    prerequisite:'Recognize common singular and plural nouns.', ageBand:'Foundation',
    concepts:[
      {name:'A and an',levels:['Use a before a consonant sound','Use an before a vowel sound','Choose by sound rather than spelling']},
      {name:'The for a known noun',levels:['Refer back to a noun already introduced','Refer to the only one in a setting','Distinguish a new item from a known item']},
      {name:'Choose an article in context',levels:['First mention of one item','Second mention of that item','Use no article for a general plural']}
    ]
  },
  {
    id:'english-determiners', name:'Determiners', subject:'english', icon:'🧺',
    prerequisite:'Recognize singular, plural and uncountable nouns.', ageBand:'Developing',
    concepts:[
      {name:'This, that, these and those',levels:['A nearby singular object','Nearby plural objects','Distant plural objects']},
      {name:'Quantity words',levels:['Many with countable plurals','Much with uncountable amounts','Each with one member at a time']},
      {name:'Choose a determiner',levels:['Some in an affirmative statement','Any in a negative statement','Enough to meet a stated need']}
    ]
  },
  {
    id:'english-prepositions', name:'Prepositions', subject:'english', icon:'📍',
    prerequisite:'Recognize nouns and understand location words.', ageBand:'Foundation',
    concepts:[
      {name:'Place',levels:['Use an explicit location clue','Distinguish inside from on top','Distinguish two sides from several surrounding sides']},
      {name:'Time',levels:['At for clock times','On for named days','In for named months']},
      {name:'Movement',levels:['Move into a container','Move across a surface','Move through an opening']}
    ]
  },
  {
    id:'english-conjunctions', name:'Conjunctions', subject:'english', icon:'🔗',
    prerequisite:'Recognize a complete sentence.', ageBand:'Developing',
    concepts:[
      {name:'Coordinate ideas',levels:['And adds an idea','But contrasts ideas','Or offers a choice']},
      {name:'Explain relationships',levels:['Because introduces a reason','So introduces a result','Although introduces a concession']},
      {name:'Connect events in time',levels:['Before means earlier','After means later','Until marks an endpoint']}
    ]
  },
  {
    id:'english-tenses', name:'Tenses', subject:'english', icon:'⏳',
    prerequisite:'Recognize action verbs and time clues.', ageBand:'Developing',
    concepts:[
      {name:'Simple tenses',levels:['Present habits','Completed past events','Future events with will']},
      {name:'Continuous tenses',levels:['An action happening now','An action ongoing in the past','An action ongoing in the future']},
      {name:'Perfect tenses',levels:['Present perfect with has','Present perfect with have','An event completed before another past event']}
    ]
  },
  {
    id:'english-subject-predicate', name:'Subject & predicate', subject:'english', icon:'🧩',
    prerequisite:'Recognize nouns, verbs and complete sentences.', ageBand:'Developing',
    concepts:[
      {name:'Find a subject',levels:['A name as the subject','A noun phrase as the subject','Ignore a phrase between subject and verb']},
      {name:'Find a predicate',levels:['An action and its object','A verb with a describing phrase','A predicate after a longer subject']},
      {name:'Keep the sentence complete',levels:['Choose a subject for a predicate','Choose a predicate for a subject','Distinguish a phrase from a complete thought']}
    ]
  },
  {
    id:'english-sentence-types', name:'Sentence types', subject:'english', icon:'💬',
    prerequisite:'Recognize statements, questions and end marks.', ageBand:'Foundation',
    concepts:[
      {name:'Purpose of a sentence',levels:['Identify a statement','Identify a question','Identify a command']},
      {name:'Change the purpose',levels:['Choose the question form','Choose a polite request','Choose an exclamation']},
      {name:'Sentence structure types',levels:['Recognize one independent clause','Recognize two joined independent clauses','Recognize a dependent and an independent clause']}
    ]
  },
  {
    id:'english-possessives', name:'Possessives', subject:'english', icon:'🎒',
    prerequisite:'Recognize singular and plural nouns.', ageBand:'Developing',
    concepts:[
      {name:'Singular possession',levels:['A named owner','One common-noun owner','Distinguish ownership from a plural']},
      {name:'Plural possession',levels:['Regular plural owners','Irregular plural owners','Distinguish singular and plural owners']},
      {name:'Possessive forms',levels:['Its for ownership','Their before a noun','Theirs without a following noun']}
    ]
  },
  {
    id:'english-direct-speech', name:'Direct speech', subject:'english', icon:'🗨️',
    prerequisite:'Use capitals, commas and sentence end marks.', ageBand:'Later challenge',
    concepts:[
      {name:'Mark spoken words',levels:['Recognize the words actually spoken','Put speech marks around the spoken sentence','Start spoken sentences with a capital']},
      {name:'Punctuate speech',levels:['Statement before a reporting clause','Question before a reporting clause','Exclamation before a reporting clause']},
      {name:'Reporting clause first',levels:['Comma after the reporting clause','Keep the speech end mark inside the marks','Distinguish a quotation from a report']}
    ]
  },
  {
    id:'english-editing', name:'Editing passages', subject:'english', icon:'🖍️',
    prerequisite:'Apply capitals, agreement, tense and punctuation.', ageBand:'Later challenge',
    concepts:[
      {name:'Find one error',levels:['Fix a sentence-start capital','Fix subject–verb agreement','Fix an irregular past tense']},
      {name:'Keep a passage consistent',levels:['Maintain past tense','Keep pronouns consistent','Remove an accidental repeated word']},
      {name:'Edit several features',levels:['Fix a capital and an end mark','Fix agreement and a capital','Fix an apostrophe and a capital']}
    ]
  },
  {
    id:'english-adjectives', name:'Adjectives', subject:'english', icon:'🎨',
    prerequisite:'Recognize common nouns.', ageBand:'Foundation',
    concepts:[
      {name:'Describe a noun',levels:['Identify a colour adjective','Identify a size adjective','Use an adjective after a linking verb']},
      {name:'Compare things',levels:['Compare two with er','Compare two with more','Use an irregular comparative']},
      {name:'Choose a superlative',levels:['Use est for the greatest of three','Use most with a longer adjective','Use an irregular superlative']}
    ]
  },
  {
    id:'english-adverbs', name:'Adverbs', subject:'english', icon:'🏃',
    prerequisite:'Recognize verbs and adjectives.', ageBand:'Developing',
    concepts:[
      {name:'How an action happens',levels:['Recognize an ly adverb','Choose an adverb rather than an adjective','Use well after an action verb']},
      {name:'When and how often',levels:['Identify an adverb of time','Identify an adverb of frequency','Place a frequency adverb before the main verb']},
      {name:'Modify a description',levels:['Very modifies an adjective','Too signals more than needed','Almost modifies completion']}
    ]
  }
] as const satisfies readonly {
  id: string; name: string; subject: 'maths' | 'english'; icon: string;
  prerequisite: string; ageBand: string; concepts: readonly Concept[];
}[];

export type CurriculumTopicId = (typeof curriculumTopics)[number]['id'];

export const isCurriculumTopic = (id: string | undefined): id is CurriculumTopicId =>
  curriculumTopics.some(topic => topic.id === id);

export const CURRICULUM_SKILL_START = 85;
