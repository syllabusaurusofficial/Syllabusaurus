const BOARD = "CBSE";
const GRADE = "Grade 11";
const SUBJECT = "Physics";
const ACADEMIC_YEAR = "2026–27";
const CBSE_SYLLABUS_URL =
  "https://cbseacademic.nic.in/web_material/CurriculumMain27/SecPart2/Physics_SecP2_2026-27.pdf";
const NCERT_BASE_URL = "https://ncert.nic.in/textbook/pdf/";
const NCERT_CHAPTER_TITLES = {
  1: "Units and Measurement",
  6: "Systems of Particles and Rotational Motion",
};

export const class11PhysicsChapters = [
  "Units and Measurements",
  "Motion in a Straight Line",
  "Motion in a Plane",
  "Laws of Motion",
  "Work, Energy and Power",
  "System of Particles and Rotational Motion",
  "Gravitation",
  "Mechanical Properties of Solids",
  "Mechanical Properties of Fluids",
  "Thermal Properties of Matter",
  "Thermodynamics",
  "Kinetic Theory",
  "Oscillations",
  "Waves",
];

const records = [];

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function chapterPdf(number) {
  const part = number <= 7 ? 1 : 2;
  const partChapter = number <= 7 ? number : number - 7;
  return `${NCERT_BASE_URL}keph${part}${String(partChapter).padStart(2, "0")}.pdf`;
}

function ncertSection(sourceChapterNumber, section) {
  if (!section) return section;
  return section.replace(/^\d+(?=\.)/, String(sourceChapterNumber));
}

function addFormula(chapterNumber, concept, name, expression, variables, options = {}) {
  const chapter = class11PhysicsChapters[chapterNumber - 1];
  const sourceChapterNumber = options.sourceChapterNumber || chapterNumber;
  const sourceChapter = NCERT_CHAPTER_TITLES[sourceChapterNumber] ||
    class11PhysicsChapters[sourceChapterNumber - 1];
  const section = ncertSection(sourceChapterNumber, options.section);
  records.push({
    id: [BOARD, GRADE, SUBJECT, chapter, concept, name].map(slug).join("-"),
    type: "formula",
    name,
    expression,
    board: BOARD,
    curriculum: "CBSE / NCERT",
    academicYear: ACADEMIC_YEAR,
    curriculumScope: options.curriculumScope || "in_scope",
    grade: GRADE,
    subject: SUBJECT,
    chapter,
    chapterNumber,
    concept,
    variables,
    variableMeanings: variables,
    units: options.units || "As indicated by the physical quantities.",
    conditions: options.conditions || "Use SI units unless stated otherwise.",
    importance: options.importance || "medium",
    importantNote: options.importantNote || "",
    category: options.category || "standard result",
    source: "NCERT",
    sourceReference: `NCERT Class XI Physics, Reprint 2026–27, Chapter ${sourceChapterNumber}: ${sourceChapter}${section ? `, ${section}` : ""}. CBSE Class XI Physics 2026–27, Chapter ${chapterNumber}.`,
    sourceUrl: chapterPdf(sourceChapterNumber),
    scopeSourceReference: `CBSE Physics (Code 042), Class XI 2026–27, Chapter ${chapterNumber}.`,
    scopeSourceUrl: CBSE_SYLLABUS_URL,
    verificationStatus: options.verificationStatus || "VERIFIED",
    relatedFormulas: options.relatedFormulas || [],
    relatedConcepts: options.relatedConcepts || [],
    commonMistakes: options.commonMistakes || [],
    examples: [],
    keywords: options.keywords || [],
  });
}

function addContent(chapterNumber, concept, type, name, text, options = {}) {
  const chapter = class11PhysicsChapters[chapterNumber - 1];
  const source = options.source || "NCERT";
  const sourceChapter = NCERT_CHAPTER_TITLES[chapterNumber] || chapter;
  const section = source === "CBSE" ? "" : ncertSection(chapterNumber, options.section);
  records.push({
    id: [BOARD, GRADE, SUBJECT, chapter, concept, name].map(slug).join("-"),
    type,
    name,
    text,
    board: BOARD,
    curriculum: "CBSE / NCERT",
    academicYear: ACADEMIC_YEAR,
    curriculumScope: options.curriculumScope || "in_scope",
    grade: GRADE,
    subject: SUBJECT,
    chapter,
    chapterNumber,
    concept,
    conditions: options.conditions || "",
    importance: options.importance || "medium",
    importantNote: options.importantNote || "",
    source,
    sourceReference: source === "CBSE"
      ? `CBSE Physics (Code 042), Class XI 2026–27, Chapter ${chapterNumber}: ${chapter}.`
      : `NCERT Class XI Physics, Reprint 2026–27, Chapter ${chapterNumber}: ${sourceChapter}${section ? `, ${section}` : ""}. CBSE Class XI Physics 2026–27, Chapter ${chapterNumber}.`,
    sourceUrl: options.sourceUrl || chapterPdf(chapterNumber),
    scopeSourceReference: `CBSE Physics (Code 042), Class XI 2026–27, Chapter ${chapterNumber}.`,
    scopeSourceUrl: CBSE_SYLLABUS_URL,
    verificationStatus: options.verificationStatus || "VERIFIED",
    relatedConcepts: options.relatedConcepts || [],
    keywords: options.keywords || [],
  });
}

addContent(1, "Measurement and SI units", "definition", "Measurement of a physical quantity",
  "A measurement compares a physical quantity with an accepted standard unit; a result consists of a numerical value and a unit.",
  { section: "1.1 Introduction", importance: "high" });
addContent(1, "Measurement and SI units", "fact", "SI base quantities and units",
  "The SI base units are metre (m), kilogram (kg), second (s), ampere (A), kelvin (K), mole (mol), and candela (cd).",
  { section: "1.2 The International System of Units", importance: "high" });
addContent(1, "Measurement uncertainty", "definition", "Absolute, relative, and percentage uncertainty",
  "Absolute uncertainty has the same unit as the measured quantity. Relative uncertainty is the ratio of absolute uncertainty to the measured value; percentage uncertainty is the relative uncertainty multiplied by 100.",
  { section: "1.3.3 Rules for determining the uncertainty in measurement", importance: "high" });
addContent(1, "Significant figures", "definition", "Significant figures",
  "Significant figures are the reliably known digits in a measured quantity together with the first uncertain digit.",
  { section: "1.3 Significant figures", importance: "high" });
addContent(1, "Significant figures", "fact", "Rules for counting significant figures",
  "All non-zero digits are significant; zeros between non-zero digits are significant; leading zeros are not significant; trailing zeros are significant when the decimal notation makes them measured digits.",
  { section: "1.3 Significant figures", importance: "high" });
addContent(1, "Significant figures", "fact", "Significant figures in arithmetic",
  "For addition or subtraction, retain the least precise decimal place. For multiplication or division, retain no more significant figures than the factor with the fewest significant figures.",
  { section: "1.3 Significant figures", importance: "high" });
addContent(1, "Dimensions", "definition", "Dimensional formula",
  "A dimensional formula expresses a physical quantity in terms of powers of the dimensions of base quantities.",
  { section: "1.4 Dimensions of physical quantities", importance: "high" });
addContent(1, "Dimensional analysis", "law", "Principle of dimensional homogeneity",
  "Every term in a physically meaningful equation must have the same dimensions.",
  { section: "1.6 Dimensional analysis and its applications", importance: "high" });
addFormula(1, "Measurement uncertainty", "Relative uncertainty",
  String.raw`$\delta_r=\frac{\Delta a}{a}$`,
  { "\\delta_r": "Relative uncertainty (dimensionless)", "\\Delta a": "Absolute uncertainty in measured quantity a", a: "Measured value" },
  { section: "1.3.3 Rules for determining the uncertainty in measurement", category: "measurement relationship", conditions: "a is non-zero." });
addFormula(1, "Measurement uncertainty", "Mean of repeated measurements",
  String.raw`$\bar a=\frac{1}{n}\sum_{i=1}^{n}a_i$`,
  { "\\bar a": "Mean measured value", n: "Number of measurements", a_i: "The i-th measured value" },
  { section: "1.3.3 Rules for determining the uncertainty in measurement", units: "Same as a" });
addFormula(1, "Measurement uncertainty", "Absolute uncertainty from repeated measurements",
  String.raw`$\Delta a=\max_i|a_i-\bar a|$`,
  { "\\Delta a": "Absolute uncertainty", a_i: "The i-th measured value", "\\bar a": "Mean measured value" },
  { section: "1.3.3 Rules for determining the uncertainty in measurement", units: "Same as a", conditions: "The maximum-deviation estimate used for repeated measurements in the chapter." });
addFormula(1, "Measurement uncertainty", "Reported repeated-measurement result",
  String.raw`$a=\bar a\pm\Delta a$`,
  { a: "Reported measured quantity", "\\bar a": "Mean measured value", "\\Delta a": "Absolute uncertainty" },
  { section: "1.3.3 Rules for determining the uncertainty in measurement", units: "Same as a" });
addFormula(1, "Measurement uncertainty", "Percentage uncertainty",
  String.raw`$\delta_{\%}=\frac{\Delta a}{a}\times100\%$`,
  { "\\delta_{\\%}": "Percentage uncertainty", "\\Delta a": "Absolute uncertainty", a: "Measured value" },
  { section: "1.3.3 Rules for determining the uncertainty in measurement", category: "measurement relationship" });
addFormula(1, "Measurement uncertainty", "Uncertainty in a sum or difference",
  String.raw`$\Delta z=\Delta x+\Delta y,\quad z=x\pm y$`,
  { z: "Sum or difference of measured quantities x and y", x: "First measured quantity", y: "Second measured quantity", "\\Delta x,\\Delta y,\\Delta z": "Absolute uncertainties" },
  { section: "1.3.3 Rules for determining the uncertainty in measurement", category: "uncertainty propagation", conditions: "For independent measured quantities; add absolute uncertainties." });
addFormula(1, "Measurement uncertainty", "Uncertainty in a product or quotient",
  String.raw`$\frac{\Delta z}{z}=\frac{\Delta x}{x}+\frac{\Delta y}{y},\quad z=xy\ \text{or}\ z=\frac{x}{y}$`,
  { z: "Product or quotient of x and y", x: "First measured quantity", y: "Second measured quantity", "\\Delta x,\\Delta y,\\Delta z": "Absolute uncertainties" },
  { section: "1.3.3 Rules for determining the uncertainty in measurement", category: "uncertainty propagation", conditions: "For independent measured quantities; add relative uncertainties." });
addFormula(1, "Measurement uncertainty", "Uncertainty in a power",
  String.raw`$\frac{\Delta z}{z}=|n|\frac{\Delta x}{x},\quad z=x^n$`,
  { z: "Power of measured quantity x", x: "Measured quantity", n: "Constant exponent" },
  { section: "1.3.3 Rules for determining the uncertainty in measurement", category: "uncertainty propagation" });
[
  ["Length", String.raw`$[L]$`],
  ["Mass", String.raw`$[M]$`],
  ["Time", String.raw`$[T]$`],
  ["Velocity", String.raw`$[LT^{-1}]$`],
  ["Acceleration", String.raw`$[LT^{-2}]$`],
  ["Momentum", String.raw`$[MLT^{-1}]$`],
  ["Force", String.raw`$[MLT^{-2}]$`],
  ["Work and energy", String.raw`$[ML^{2}T^{-2}]$`],
  ["Power", String.raw`$[ML^{2}T^{-3}]$`],
  ["Pressure and stress", String.raw`$[ML^{-1}T^{-2}]$`],
  ["Density", String.raw`$[ML^{-3}]$`],
  ["Area", String.raw`$[L^2]$`],
  ["Volume", String.raw`$[L^3]$`],
  ["Frequency", String.raw`$[T^{-1}]$`],
  ["Angular velocity", String.raw`$[T^{-1}]$`],
  ["Angular acceleration", String.raw`$[T^{-2}]$`],
  ["Torque", String.raw`$[ML^2T^{-2}]$`],
  ["Angular momentum", String.raw`$[ML^2T^{-1}]$`],
  ["Moment of inertia", String.raw`$[ML^2]$`],
  ["Dynamic viscosity", String.raw`$[ML^{-1}T^{-1}]$`],
  ["Surface tension", String.raw`$[MT^{-2}]$`],
  ["Heat capacity", String.raw`$[ML^2T^{-2}\Theta^{-1}]$`],
  ["Specific heat capacity", String.raw`$[L^2T^{-2}\Theta^{-1}]$`],
  ["Thermal expansion coefficient", String.raw`$[\Theta^{-1}]$`],
  ["Spring constant", String.raw`$[MT^{-2}]$`],
  ["Thermal conductivity", String.raw`$[MLT^{-3}\Theta^{-1}]$`],
  ["Wave number", String.raw`$[L^{-1}]$`],
  ["Gravitational constant", String.raw`$[M^{-1}L^{3}T^{-2}]$`],
].forEach(([quantity, expression]) => addFormula(1, "Dimensions", `Dimensions of ${quantity}`, expression, {},
  { section: "1.5 Dimensional formulae and dimensional equations", category: "dimension", units: "Dimensionless expression." }));

addContent(2, "Position and displacement", "definition", "Displacement in one dimension",
  "Displacement is the change in position; it is a signed vector quantity in one-dimensional motion.",
  { section: "2.2 Instantaneous velocity and speed", importance: "high" });
addContent(2, "Frame of reference", "definition", "Frame of reference",
  "A frame of reference specifies the coordinate system and clock used to describe an object's position and motion.",
  { section: "2.1 Introduction", importance: "high" });
addFormula(2, "Position and displacement", "Displacement",
  String.raw`$\Delta x=x_2-x_1$`,
  { "\\Delta x": "Displacement", x_1: "Initial position", x_2: "Final position" },
  { section: "2.2 Instantaneous velocity and speed", units: "m" });
addFormula(2, "Average and instantaneous velocity", "Average velocity",
  String.raw`$\bar v=\frac{\Delta x}{\Delta t}$`,
  { "\\bar v": "Average velocity", "\\Delta x": "Displacement", "\\Delta t": "Elapsed time" },
  { section: "2.2 Instantaneous velocity and speed", units: "m s⁻¹" });
addFormula(2, "Average and instantaneous velocity", "Instantaneous velocity",
  String.raw`$v=\frac{dx}{dt}$`,
  { v: "Instantaneous velocity", x: "Position", t: "Time" },
  { section: "2.2 Instantaneous velocity and speed", units: "m s⁻¹" });
addFormula(2, "Speed", "Average speed",
  String.raw`$\text{average speed}=\frac{\text{total distance}}{\text{total time}}$`,
  { "total distance": "Total path length", "total time": "Elapsed time" },
  { section: "2.2 Instantaneous velocity and speed", units: "m s⁻¹", conditions: "Average speed is non-negative and is not generally equal to the magnitude of average velocity." });
addFormula(2, "Acceleration", "Average acceleration",
  String.raw`$\bar a=\frac{\Delta v}{\Delta t}$`,
  { "\\bar a": "Average acceleration", "\\Delta v": "Change in velocity", "\\Delta t": "Elapsed time" },
  { section: "2.3 Acceleration", units: "m s⁻²" });
addFormula(2, "Acceleration", "Instantaneous acceleration",
  String.raw`$a=\frac{dv}{dt}=\frac{d^2x}{dt^2}$`,
  { a: "Instantaneous acceleration", v: "Velocity", x: "Position", t: "Time" },
  { section: "2.3 Acceleration", units: "m s⁻²" });
addFormula(2, "Uniformly accelerated motion", "Velocity-time relation",
  String.raw`$v=u+at$`,
  { v: "Final velocity", u: "Initial velocity", a: "Constant acceleration", t: "Elapsed time" },
  { section: "2.4 Kinematic equations for uniformly accelerated motion", units: "m s⁻¹", conditions: "Acceleration is constant." });
addFormula(2, "Uniformly accelerated motion", "Position-time relation",
  String.raw`$x=x_0+ut+\frac{1}{2}at^2$`,
  { x: "Position after time t", x_0: "Initial position", u: "Initial velocity", a: "Constant acceleration", t: "Elapsed time" },
  { section: "2.4 Kinematic equations for uniformly accelerated motion", units: "m", conditions: "Acceleration is constant." });
addFormula(2, "Uniformly accelerated motion", "Velocity-displacement relation",
  String.raw`$v^2=u^2+2a(x-x_0)$`,
  { v: "Final velocity", u: "Initial velocity", a: "Constant acceleration", x: "Final position", x_0: "Initial position" },
  { section: "2.4 Kinematic equations for uniformly accelerated motion", units: "m² s⁻²", conditions: "Acceleration is constant." });
addFormula(2, "Uniformly accelerated motion", "Displacement from average velocity",
  String.raw`$x-x_0=\frac{u+v}{2}\,t$`,
  { x: "Final position", x_0: "Initial position", u: "Initial velocity", v: "Final velocity", t: "Elapsed time" },
  { section: "2.4 Kinematic equations for uniformly accelerated motion", units: "m", conditions: "Acceleration is constant." });
addContent(2, "Motion graphs", "fact", "Slopes and areas in motion graphs",
  "The slope of a position–time graph gives velocity; the slope of a velocity–time graph gives acceleration; the signed area under a velocity–time graph gives displacement.",
  { section: "2.4 Kinematic equations for uniformly accelerated motion", importance: "high" });
addFormula(2, "Relative motion", "Relative velocity in one dimension",
  String.raw`$v_{A/B}=v_A-v_B$`,
  { "v_{A/B}": "Velocity of A relative to B", v_A: "Velocity of A in the chosen frame", v_B: "Velocity of B in the same frame" },
  { section: "2.5 Relative velocity", units: "m s⁻¹", conditions: "Use signed velocities along the same axis.", verificationStatus: "DERIVED", category: "derived result" });
addFormula(2, "Free fall", "Velocity in free fall",
  String.raw`$v=u+gt$`,
  { v: "Final vertical velocity", u: "Initial vertical velocity", g: "Acceleration due to gravity", t: "Elapsed time" },
  { section: "2.4 Kinematic equations for uniformly accelerated motion", units: "m s⁻¹", conditions: "Near Earth's surface; neglect air resistance; choose downward as positive." });
addFormula(2, "Free fall", "Vertical displacement in free fall",
  String.raw`$y-y_0=ut+\frac{1}{2}gt^2$`,
  { y: "Final vertical coordinate", y_0: "Initial vertical coordinate", u: "Initial vertical velocity", g: "Acceleration due to gravity", t: "Elapsed time" },
  { section: "2.4 Kinematic equations for uniformly accelerated motion", units: "m", conditions: "Near Earth's surface; neglect air resistance; choose downward as positive." });

addFormula(3, "Vector components", "Rectangular components of a plane vector",
  String.raw`$\vec A=A_x\hat i+A_y\hat j,\quad A_x=A\cos\theta,\quad A_y=A\sin\theta$`,
  { "\\vec A": "Vector in the plane", A: "Magnitude of the vector", "\\hat i,\\hat j": "Unit vectors along x and y", "\\theta": "Angle measured from the positive x-axis", A_x: "x-component", A_y: "y-component" },
  { section: "3.5 Resolution of vectors", units: "Same as A" });
addFormula(3, "Position and displacement vectors", "Position vector in a plane",
  String.raw`$\vec r=x\hat i+y\hat j$`,
  { "\\vec r": "Position vector", x: "x-coordinate", y: "y-coordinate", "\\hat i,\\hat j": "Cartesian unit vectors" },
  { section: "3.7 Motion in a plane", units: "m" });
addFormula(3, "Position and displacement vectors", "Displacement vector",
  String.raw`$\Delta\vec r=\vec r_2-\vec r_1$`,
  { "\\Delta\\vec r": "Displacement vector", "\\vec r_1": "Initial position vector", "\\vec r_2": "Final position vector" },
  { section: "3.7 Motion in a plane", units: "m" });
addFormula(3, "Velocity in a plane", "Average velocity vector",
  String.raw`$\vec v_{\mathrm{av}}=\frac{\Delta\vec r}{\Delta t}$`,
  { "\\vec v_{\\mathrm{av}}": "Average velocity vector", "\\Delta\\vec r": "Displacement vector", "\\Delta t": "Elapsed time" },
  { section: "3.7 Motion in a plane", units: "m s⁻¹" });
addFormula(3, "Velocity in a plane", "Instantaneous velocity vector",
  String.raw`$\vec v=\frac{d\vec r}{dt}$`,
  { "\\vec v": "Instantaneous velocity", "\\vec r": "Position vector", t: "Time" },
  { section: "3.7 Motion in a plane", units: "m s⁻¹" });
addFormula(3, "Acceleration in a plane", "Instantaneous acceleration vector",
  String.raw`$\vec a=\frac{d\vec v}{dt}$`,
  { "\\vec a": "Instantaneous acceleration", "\\vec v": "Velocity vector", t: "Time" },
  { section: "3.7 Motion in a plane", units: "m s⁻²" });
addContent(3, "Scalars and vectors", "definition", "Scalar and vector quantities",
  "A scalar is specified by magnitude alone; a vector has magnitude and direction and obeys vector addition.",
  { section: "3.2 Scalars and vectors", importance: "high" });
addFormula(3, "Vector representation", "Unit vector along a non-zero vector",
  String.raw`$\hat A=\frac{\vec A}{|\vec A|}$`,
  { "\\hat A": "Unit vector in the direction of A", "\\vec A": "Non-zero vector", "|A|": "Magnitude of A" },
  { section: "3.5 Resolution of vectors", units: "Dimensionless" });
addContent(3, "Vector addition", "fact", "Vector equality and subtraction",
  "Two vectors are equal when they have the same magnitude and direction. Subtraction is addition of the negative vector: A − B = A + (−B).",
  { section: "3.4 Addition of vectors — graphical method", importance: "high" });
addFormula(3, "Vector components", "Magnitude from rectangular components",
  String.raw`$A=\sqrt{A_x^2+A_y^2}$`,
  { A: "Magnitude of vector", A_x: "x-component", A_y: "y-component" },
  { section: "3.5 Resolution of vectors", units: "Same as A" });
addFormula(3, "Vector addition", "Components of a vector sum",
  String.raw`$\vec R=\vec A+\vec B,\quad R_x=A_x+B_x,\quad R_y=A_y+B_y$`,
  { "\\vec R": "Resultant vector", "\\vec A,\\vec B": "Added vectors", R_x: "x-component of resultant", R_y: "y-component of resultant" },
  { section: "3.6 Vector addition — analytical method", units: "Same as A and B" });
addFormula(3, "Scalar product", "Scalar product of two vectors",
  String.raw`$\vec A\cdot\vec B=AB\cos\theta$`,
  { "\\vec A,\\vec B": "Vectors", A: "Magnitude of A", B: "Magnitude of B", "\\theta": "Angle between the vectors" },
  { sourceChapterNumber: 5, section: "5.1.1 The scalar product", category: "vector relationship" });
addFormula(3, "Vector product", "Magnitude of vector product",
  String.raw`$|\vec A\times\vec B|=AB\sin\theta$`,
  { "\\vec A,\\vec B": "Vectors", A: "Magnitude of A", B: "Magnitude of B", "\\theta": "Angle between the vectors" },
  { sourceChapterNumber: 6, section: "6.5 Vector product of two vectors", category: "vector relationship", conditions: "The direction is perpendicular to the plane of A and B, given by the right-hand rule." });
addFormula(3, "Relative motion", "Relative velocity vector",
  String.raw`$\vec v_{A/B}=\vec v_A-\vec v_B$`,
  { "\\vec v_{A/B}": "Velocity of A relative to B", "\\vec v_A": "Velocity of A in the chosen frame", "\\vec v_B": "Velocity of B in the same frame" },
  { section: "3.7 Motion in a plane", units: "m s⁻¹", conditions: "Both velocities are measured in the same reference frame.", verificationStatus: "DERIVED", category: "derived result" });
addFormula(3, "Projectile motion", "Horizontal position of a projectile",
  String.raw`$x=(u\cos\theta)t$`,
  { x: "Horizontal displacement", u: "Launch speed", "\\theta": "Launch angle above horizontal", t: "Time after launch" },
  { section: "3.9 Projectile motion", units: "m", conditions: "Neglect air resistance; uniform gravitational field; launch from the origin." });
addFormula(3, "Projectile motion", "Vertical position of a projectile",
  String.raw`$y=(u\sin\theta)t-\frac{1}{2}gt^2$`,
  { y: "Vertical displacement", u: "Launch speed", "\\theta": "Launch angle above horizontal", g: "Acceleration due to gravity", t: "Time after launch" },
  { section: "3.9 Projectile motion", units: "m", conditions: "Neglect air resistance; uniform gravitational field; upward positive." });
addFormula(3, "Projectile motion", "Trajectory of a projectile",
  String.raw`$y=x\tan\theta-\frac{gx^2}{2u^2\cos^2\theta}$`,
  { x: "Horizontal displacement", y: "Vertical displacement", u: "Launch speed", "\\theta": "Launch angle", g: "Acceleration due to gravity" },
  { section: "3.9 Projectile motion", units: "m", conditions: "Neglect air resistance; uniform gravitational field; launch and landing heights need not be equal." });
addFormula(3, "Projectile motion", "Time of flight for equal launch and landing heights",
  String.raw`$T=\frac{2u\sin\theta}{g}$`,
  { T: "Time of flight", u: "Launch speed", "\\theta": "Launch angle above horizontal", g: "Acceleration due to gravity" },
  { section: "3.9 Projectile motion", units: "s", conditions: "Launch and landing heights are equal; neglect air resistance." });
addFormula(3, "Projectile motion", "Maximum height",
  String.raw`$H=\frac{u^2\sin^2\theta}{2g}$`,
  { H: "Maximum height above launch point", u: "Launch speed", "\\theta": "Launch angle", g: "Acceleration due to gravity" },
  { section: "3.9 Projectile motion", units: "m", conditions: "Neglect air resistance; uniform gravitational field." });
addFormula(3, "Projectile motion", "Horizontal range for equal launch and landing heights",
  String.raw`$R=\frac{u^2\sin 2\theta}{g}$`,
  { R: "Horizontal range", u: "Launch speed", "\\theta": "Launch angle", g: "Acceleration due to gravity" },
  { section: "3.9 Projectile motion", units: "m", conditions: "Launch and landing heights are equal; neglect air resistance." });
addFormula(3, "Projectile motion", "Maximum horizontal range",
  String.raw`$R_{\max}=\frac{u^2}{g}$`,
  { "R_{\\max}": "Maximum horizontal range", u: "Launch speed", g: "Acceleration due to gravity" },
  { section: "3.9 Projectile motion", units: "m", conditions: "Equal launch and landing heights; attained at launch angle 45°; neglect air resistance.", category: "special case" });
addFormula(3, "Uniform circular motion", "Angular speed and period",
  String.raw`$\omega=\frac{2\pi}{T}=2\pi f$`,
  { "\\omega": "Angular speed", T: "Period", f: "Frequency" },
  { section: "3.10 Uniform circular motion", units: "rad s⁻¹" });
addFormula(3, "Uniform circular motion", "Linear speed in circular motion",
  String.raw`$v=r\omega=\frac{2\pi r}{T}$`,
  { v: "Speed", r: "Radius", "\\omega": "Angular speed", T: "Period" },
  { section: "3.10 Uniform circular motion", units: "m s⁻¹" });
addFormula(3, "Uniform circular motion", "Centripetal acceleration",
  String.raw`$a_c=\frac{v^2}{r}=r\omega^2$`,
  { a_c: "Centripetal acceleration", v: "Speed", r: "Radius", "\\omega": "Angular speed" },
  { section: "3.10 Uniform circular motion", units: "m s⁻²", conditions: "Directed toward the centre of the circular path." });

addContent(4, "Newton's laws", "law", "Newton's first law",
  "A body remains at rest or continues in uniform motion in a straight line unless acted upon by a net external force.",
  { section: "5.4 Newton’s first law of motion", importance: "high" });
addContent(4, "Force and inertia", "definition", "Force",
  "Force is an interaction that can change a body's state of motion; the net force determines its acceleration.",
  { section: "5.2 Aristotle’s fallacy", importance: "high" });
addContent(4, "Force and inertia", "definition", "Inertia",
  "Inertia is the tendency of a body to resist a change in its state of rest or uniform straight-line motion; mass measures translational inertia.",
  { section: "5.3 The law of inertia", importance: "high" });
addContent(4, "Newton's laws", "law", "Newton's second law",
  "The rate of change of momentum is proportional to the net force and is in the direction of that force.",
  { section: "5.5 Newton’s second law of motion", importance: "high" });
addContent(4, "Newton's laws", "law", "Newton's third law",
  "For every action there is an equal and opposite reaction; the two forces act on different bodies.",
  { section: "5.6 Newton’s third law of motion", importance: "high" });
addContent(4, "Friction", "law", "Coulomb's laws of friction",
  "For dry surfaces, limiting friction is proportional to the normal reaction; kinetic friction is approximately independent of contact area and sliding speed in the stated regime, and is generally less than limiting friction.",
  { section: "5.9 Common forces in mechanics", importance: "high", importantNote: "Friction laws are empirical and apply within their stated contact and speed conditions." });
addFormula(4, "Momentum", "Linear momentum",
  String.raw`$\vec p=m\vec v$`,
  { "\\vec p": "Linear momentum", m: "Mass", "\\vec v": "Velocity" },
  { section: "5.5 Newton’s second law of motion", units: "kg m s⁻¹" });
addFormula(4, "Newton's laws", "Newton's second law in momentum form",
  String.raw`$\vec F_{\text{net}}=\frac{d\vec p}{dt}$`,
  { "\\vec F_{\\text{net}}": "Net external force", "\\vec p": "Linear momentum", t: "Time" },
  { section: "5.5 Newton’s second law of motion", units: "N" });
addFormula(4, "Newton's laws", "Newton's second law for constant mass",
  String.raw`$\vec F_{\text{net}}=m\vec a$`,
  { "\\vec F_{\\text{net}}": "Net external force", m: "Mass", "\\vec a": "Acceleration" },
  { section: "5.5 Newton’s second law of motion", units: "N", conditions: "Mass is constant." });
addFormula(4, "Impulse", "Impulse of a force",
  String.raw`$\vec J=\int_{t_1}^{t_2}\vec F\,dt=\Delta\vec p$`,
  { "\\vec J": "Impulse", "\\vec F": "Net force", "\\Delta\\vec p": "Change in momentum", t: "Time" },
  { section: "5.5 Newton’s second law of motion", units: "N s = kg m s⁻¹" });
addFormula(4, "Conservation of momentum", "Conservation of total linear momentum",
  String.raw`$\sum_i\vec p_i=\text{constant}$`,
  { "\\vec p_i": "Momentum of the i-th body" },
  { section: "5.7 Conservation of momentum", conditions: "The net external force on the system is zero." });
addFormula(4, "Equilibrium", "Translational equilibrium",
  String.raw`$\sum_i\vec F_i=\vec 0$`,
  { "\\vec F_i": "Force acting on the body" },
  { section: "5.8 Equilibrium of a particle", conditions: "The particle has zero acceleration in the chosen inertial frame." });
addFormula(4, "Friction", "Limiting friction",
  String.raw`$f_{\max}=\mu_s N$`,
  { "f_{\\max}": "Limiting static friction", "\\mu_s": "Coefficient of static friction", N: "Normal reaction" },
  { section: "5.9 Common forces in mechanics", units: "N", conditions: "At the threshold of slipping." });
addFormula(4, "Friction", "Kinetic friction",
  String.raw`$f_k=\mu_k N$`,
  { f_k: "Kinetic friction", "\\mu_k": "Coefficient of kinetic friction", N: "Normal reaction" },
  { section: "5.9 Common forces in mechanics", units: "N", conditions: "For dry sliding contact in the empirical model used in the chapter." });
addContent(4, "Friction", "definition", "Static and kinetic friction",
  "Static friction prevents relative motion while surfaces do not slip; kinetic friction acts during sliding.",
  { section: "5.9 Common forces in mechanics", importance: "high" });
addContent(4, "Friction", "fact", "Rolling friction and lubrication",
  "Rolling resistance is generally smaller than sliding friction. Lubricants separate surfaces and reduce frictional effects.",
  { section: "5.9 Common forces in mechanics" });
addFormula(4, "Uniform circular motion", "Centripetal force requirement",
  String.raw`$F_c=\frac{mv^2}{r}=mr\omega^2$`,
  { F_c: "Net inward force", m: "Mass", v: "Speed", r: "Radius", "\\omega": "Angular speed" },
  { section: "5.10 Circular motion", units: "N", conditions: "The net radial force points toward the centre; this is not an additional kind of force." });
addFormula(4, "Vehicle on a level circular road", "Maximum speed on a level road",
  String.raw`$v_{\max}=\sqrt{\mu_srg}$`,
  { "v_{\\max}": "Maximum speed without slipping", "\\mu_s": "Coefficient of static friction", r: "Road-curve radius", g: "Acceleration due to gravity" },
  { section: "5.10 Circular motion", units: "m s⁻¹", conditions: "Friction supplies the centripetal force; level road." });
addFormula(4, "Vehicle on a banked road", "Design speed of a frictionless banked road",
  String.raw`$\tan\theta=\frac{v^2}{rg}$`,
  { "\\theta": "Bank angle", v: "Vehicle speed", r: "Curve radius", g: "Acceleration due to gravity" },
  { section: "5.10 Circular motion", conditions: "No lateral friction is required at the design speed." });

addFormula(5, "Work", "Work by a constant force",
  String.raw`$W=\vec F\cdot\Delta\vec r=F\,\Delta r\cos\theta$`,
  { W: "Work", "\\vec F": "Constant force", "\\Delta\\vec r": "Displacement", "\\theta": "Angle between force and displacement" },
  { section: "6.3 Work", units: "J" });
addFormula(5, "Work", "Work by a variable force",
  String.raw`$W=\int_{\vec r_1}^{\vec r_2}\vec F\cdot d\vec r$`,
  { W: "Work", "\\vec F": "Position-dependent force", "\\vec r": "Position" },
  { section: "6.5 Work done by a variable force", units: "J" });
addFormula(5, "Kinetic energy", "Translational kinetic energy",
  String.raw`$K=\frac{1}{2}mv^2$`,
  { K: "Kinetic energy", m: "Mass", v: "Speed" },
  { section: "6.4 Kinetic energy", units: "J" });
addFormula(5, "Work-energy theorem", "Work-energy theorem",
  String.raw`$W_{\text{net}}=\Delta K=K_f-K_i$`,
  { "W_{\\text{net}}": "Net work", K_i: "Initial kinetic energy", K_f: "Final kinetic energy" },
  { section: "6.2 Notions of work and kinetic energy", units: "J" });
addFormula(5, "Power", "Average power",
  String.raw`$P_{\text{av}}=\frac{W}{\Delta t}$`,
  { "P_{\\text{av}}": "Average power", W: "Work", "\\Delta t": "Time interval" },
  { section: "6.10 Power", units: "W" });
addFormula(5, "Power", "Instantaneous power",
  String.raw`$P=\frac{dW}{dt}=\vec F\cdot\vec v$`,
  { P: "Instantaneous power", W: "Work", "\\vec F": "Force", "\\vec v": "Velocity" },
  { section: "6.10 Power", units: "W" });
addFormula(5, "Gravitational potential energy", "Near-Earth gravitational potential energy",
  String.raw`$U=mgh$`,
  { U: "Gravitational potential energy relative to the chosen zero", m: "Mass", g: "Acceleration due to gravity", h: "Height above the reference level" },
  { section: "6.7 The concept of potential energy", units: "J", conditions: "Uniform g over the height range; the zero of potential energy is chosen at h=0." });
addFormula(5, "Spring potential energy", "Elastic potential energy of a spring",
  String.raw`$U_s=\frac{1}{2}kx^2$`,
  { U_s: "Spring potential energy", k: "Spring constant", x: "Extension or compression from natural length" },
  { section: "6.9 The potential energy of a spring", units: "J", conditions: "Ideal Hookean spring." });
addContent(5, "Conservative forces", "definition", "Conservative force",
  "The work done by a conservative force between two positions is path-independent; its work over a closed path is zero.",
  { section: "6.8 The conservation of mechanical energy", importance: "high" });
addContent(5, "Non-conservative forces", "definition", "Non-conservative force",
  "The work done by a non-conservative force depends on the path; friction is a common example.",
  { section: "6.8 The conservation of mechanical energy" });
addContent(5, "Collisions", "definition", "Elastic and inelastic collisions",
  "In an elastic collision, total kinetic energy and momentum are conserved. In an inelastic collision, momentum is conserved for an isolated system but kinetic energy is not; a perfectly inelastic collision has common final velocity.",
  { section: "6.11 Collisions", importance: "high" });
addFormula(5, "Mechanical energy", "Conservation of mechanical energy",
  String.raw`$K_i+U_i=K_f+U_f$`,
  { K_i: "Initial kinetic energy", U_i: "Initial potential energy", K_f: "Final kinetic energy", U_f: "Final potential energy" },
  { section: "6.8 The conservation of mechanical energy", conditions: "Only conservative forces do work, or the net work by non-conservative forces is zero." });
addFormula(5, "Vertical circular motion", "Minimum speed at the top of a vertical circle",
  String.raw`$v_{\text{top,min}}=\sqrt{gr}$`,
  { "v_{\\text{top,min}}": "Minimum speed at the top", g: "Acceleration due to gravity", r: "Radius of the circular path" },
  { section: "6.8 The conservation of mechanical energy", units: "m s⁻¹", conditions: "For a body just maintaining contact at the top; normal reaction is zero." });
addFormula(5, "Vertical circular motion", "Minimum speed at the bottom of a vertical circle",
  String.raw`$v_{\text{bottom,min}}=\sqrt{5gr}$`,
  { "v_{\\text{bottom,min}}": "Minimum speed at the bottom", g: "Acceleration due to gravity", r: "Radius of the circular path" },
  { section: "6.8 The conservation of mechanical energy", units: "m s⁻¹", conditions: "For just-maintained contact at the top and conservation of mechanical energy between bottom and top.", verificationStatus: "DERIVED", category: "derived result" });
addFormula(5, "Collisions", "Coefficient of restitution in one dimension",
  String.raw`$e=\frac{v_2-v_1}{u_1-u_2}$`,
  { e: "Coefficient of restitution", u_1: "Initial velocity of body 1", u_2: "Initial velocity of body 2", v_1: "Final velocity of body 1", v_2: "Final velocity of body 2" },
  { section: "6.11 Collisions", conditions: "Take the positive direction along the line of impact; the displayed form assumes body 1 approaches body 2." });
addFormula(5, "Collisions", "Final velocities in a one-dimensional elastic collision",
  String.raw`$v_1=\frac{(m_1-m_2)u_1+2m_2u_2}{m_1+m_2},\quad v_2=\frac{2m_1u_1+(m_2-m_1)u_2}{m_1+m_2}$`,
  { m_1: "Mass of body 1", m_2: "Mass of body 2", u_1: "Initial velocity of body 1", u_2: "Initial velocity of body 2", v_1: "Final velocity of body 1", v_2: "Final velocity of body 2" },
  { section: "6.11 Collisions", conditions: "One-dimensional isolated two-body collision; coefficient of restitution e=1.", importance: "high", verificationStatus: "DERIVED", category: "derived result" });
addFormula(5, "Collisions", "Momentum conservation in a two-dimensional collision",
  String.raw`$m_1\vec u_1+m_2\vec u_2=m_1\vec v_1+m_2\vec v_2$`,
  { m_1: "Mass of body 1", m_2: "Mass of body 2", "\\vec u_1,\\vec u_2": "Initial velocities", "\\vec v_1,\\vec v_2": "Final velocities" },
  { section: "6.11 Collisions", conditions: "The net external impulse on the two-body system is negligible during collision." });

addFormula(6, "Centre of mass", "Centre of mass of two particles",
  String.raw`$\vec R_{\text{cm}}=\frac{m_1\vec r_1+m_2\vec r_2}{m_1+m_2}$`,
  { "\\vec R_{\\text{cm}}": "Centre-of-mass position", m_1: "Mass of particle 1", m_2: "Mass of particle 2", "\\vec r_1,\\vec r_2": "Particle positions" },
  { section: "7.2 Centre of mass", units: "m" });
addFormula(6, "Centre of mass", "Centre of mass of a continuous body",
  String.raw`$\vec R_{\text{cm}}=\frac{1}{M}\int \vec r\,dm$`,
  { "\\vec R_{\\text{cm}}": "Centre-of-mass position", M: "Total mass", "\\vec r": "Position of mass element dm" },
  { section: "7.2 Centre of mass", units: "m", conditions: "The integral extends over the whole body." });
addFormula(6, "Centre of mass", "Centre of mass of a uniform rod",
  String.raw`$x_{\text{cm}}=\frac{L}{2}$`,
  { "x_{\\text{cm}}": "Centre-of-mass coordinate from one end", L: "Length of the rod" },
  { section: "7.2 Centre of mass", units: "m", conditions: "Uniform rod; coordinate origin at one end." });
addFormula(6, "Centre-of-mass motion", "Total momentum and centre-of-mass velocity",
  String.raw`$\vec P=M\vec V_{\text{cm}}$`,
  { "\\vec P": "Total momentum", M: "Total mass", "\\vec V_{\\text{cm}}": "Centre-of-mass velocity" },
  { section: "7.4 Linear momentum of a system of particles", units: "kg m s⁻¹" });
addFormula(6, "Centre-of-mass motion", "External force and centre-of-mass acceleration",
  String.raw`$\vec F_{\text{ext}}=M\vec a_{\text{cm}}$`,
  { "\\vec F_{\\text{ext}}": "Net external force", M: "Total mass", "\\vec a_{\\text{cm}}": "Centre-of-mass acceleration" },
  { section: "7.3 Motion of centre of mass", units: "N" });
addContent(6, "Linear and rotational motion", "fact", "Linear-rotational motion correspondence",
  "For rotation about a fixed axis, angular displacement corresponds to linear displacement, angular velocity to linear velocity, angular acceleration to linear acceleration, torque to force, moment of inertia to mass, and angular momentum to linear momentum.",
  { section: "7.10 Kinematics of rotational motion about a fixed axis", importance: "high" });
addFormula(6, "Torque", "Torque of a force",
  String.raw`$\vec\tau=\vec r\times\vec F,\quad |\tau|=rF\sin\theta$`,
  { "\\vec\\tau": "Torque about the chosen origin", "\\vec r": "Position vector from origin to point of application", "\\vec F": "Force", "\\theta": "Angle between r and F" },
  { section: "7.7 Torque and angular momentum", units: "N m" });
addFormula(6, "Angular momentum", "Angular momentum of a particle",
  String.raw`$\vec L=\vec r\times\vec p$`,
  { "\\vec L": "Angular momentum about the chosen origin", "\\vec r": "Position vector", "\\vec p": "Linear momentum" },
  { section: "7.7 Torque and angular momentum", units: "kg m² s⁻¹" });
addFormula(6, "Angular momentum", "Angular momentum of a rigid body about a fixed axis",
  String.raw`$L=I\omega$`,
  { L: "Angular momentum about the fixed axis", I: "Moment of inertia about that axis", "\\omega": "Angular velocity" },
  { section: "7.7 Torque and angular momentum", units: "kg m² s⁻¹" });
addFormula(6, "Angular momentum", "Torque-angular momentum relation",
  String.raw`$\vec\tau_{\text{ext}}=\frac{d\vec L}{dt}$`,
  { "\\vec\\tau_{\\text{ext}}": "Net external torque", "\\vec L": "Angular momentum", t: "Time" },
  { section: "7.7 Torque and angular momentum", units: "N m" });
addFormula(6, "Angular momentum", "Conservation of angular momentum",
  String.raw`$\vec L_i=\vec L_f$`,
  { "\\vec L_i": "Initial angular momentum", "\\vec L_f": "Final angular momentum" },
  { section: "7.7 Torque and angular momentum", conditions: "Net external torque on the system is zero." });
addFormula(6, "Angular kinematics", "Angular velocity",
  String.raw`$\omega=\frac{d\theta}{dt}$`,
  { "\\omega": "Angular velocity", "\\theta": "Angular displacement", t: "Time" },
  { section: "7.6 Angular velocity and its relation with linear velocity", units: "rad s⁻¹" });
addFormula(6, "Angular kinematics", "Angular acceleration",
  String.raw`$\alpha=\frac{d\omega}{dt}$`,
  { "\\alpha": "Angular acceleration", "\\omega": "Angular velocity", t: "Time" },
  { section: "7.10 Kinematics of rotational motion about a fixed axis", units: "rad s⁻²" });
addFormula(6, "Angular kinematics", "Rotational equations for constant angular acceleration",
  String.raw`$\omega=\omega_0+\alpha t,\quad \theta-\theta_0=\omega_0t+\frac{1}{2}\alpha t^2,\quad \omega^2=\omega_0^2+2\alpha(\theta-\theta_0)$`,
  { "\\omega": "Final angular velocity", "\\omega_0": "Initial angular velocity", "\\alpha": "Constant angular acceleration", t: "Time", "\\theta": "Final angular position", "\\theta_0": "Initial angular position" },
  { section: "7.10 Kinematics of rotational motion about a fixed axis", conditions: "Angular acceleration is constant." });
addFormula(6, "Moment of inertia", "Moment of inertia for discrete particles",
  String.raw`$I=\sum_i m_i r_i^2$`,
  { I: "Moment of inertia about the chosen axis", m_i: "Mass of particle i", r_i: "Perpendicular distance from particle i to the axis" },
  { section: "7.9 Moment of inertia", units: "kg m²" });
addFormula(6, "Moment of inertia", "Radius of gyration",
  String.raw`$I=Mk^2$`,
  { I: "Moment of inertia", M: "Total mass", k: "Radius of gyration about the same axis" },
  { section: "7.9 Moment of inertia", units: "kg m²" });
addFormula(6, "Rotational dynamics", "Torque and angular acceleration",
  String.raw`$\tau_{\text{net}}=I\alpha$`,
  { "\\tau_{\\text{net}}": "Net torque about the fixed axis", I: "Moment of inertia about that axis", "\\alpha": "Angular acceleration" },
  { section: "7.11 Dynamics of rotational motion about a fixed axis", units: "N m", conditions: "Rigid body rotates about a fixed axis; I is constant." });
addFormula(6, "Rotational kinetic energy", "Rotational kinetic energy about a fixed axis",
  String.raw`$K_{\text{rot}}=\frac{1}{2}I\omega^2$`,
  { "K_{\\text{rot}}": "Rotational kinetic energy", I: "Moment of inertia", "\\omega": "Angular speed" },
  { section: "7.11 Dynamics of rotational motion about a fixed axis", units: "J" });
addFormula(6, "Rolling motion", "No-slip rolling relation",
  String.raw`$v_{\text{cm}}=R\omega$`,
  { "v_{\\text{cm}}": "Centre-of-mass speed", R: "Rolling radius", "\\omega": "Angular speed" },
  { section: "7.6 Angular velocity and its relation with linear velocity", units: "m s⁻¹", conditions: "Rolling without slipping." });
addFormula(6, "Rolling motion", "Kinetic energy of a rolling rigid body",
  String.raw`$K=\frac{1}{2}Mv_{\text{cm}}^2+\frac{1}{2}I_{\text{cm}}\omega^2$`,
  { K: "Total kinetic energy", M: "Total mass", "v_{\\text{cm}}": "Centre-of-mass speed", "I_{\\text{cm}}": "Moment of inertia about the centre of mass", "\\omega": "Angular speed" },
  { section: "7.6 Angular velocity and its relation with linear velocity", units: "J", conditions: "Rigid body rolls without slipping on a fixed surface." });
addFormula(6, "Parallel-axis theorem", "Parallel-axis theorem",
  String.raw`$I=I_{\text{cm}}+Md^2$`,
  { I: "Moment of inertia about an axis", "I_{\\text{cm}}": "Moment of inertia about the parallel centre-of-mass axis", M: "Total mass", d: "Distance between axes" },
  { section: "7.9 Moment of inertia", conditions: "The two axes are parallel." });
addFormula(6, "Perpendicular-axis theorem", "Perpendicular-axis theorem",
  String.raw`$I_z=I_x+I_y$`,
  { I_z: "Moment of inertia about z-axis", I_x: "Moment of inertia about x-axis", I_y: "Moment of inertia about y-axis" },
  { section: "7.9 Moment of inertia", conditions: "For a plane lamina, with x and y in its plane and z perpendicular to it." });
[
  ["Thin ring about its central axis perpendicular to its plane", String.raw`$I=MR^2$`],
  ["Thin ring about a diameter", String.raw`$I=\frac{1}{2}MR^2$`],
  ["Uniform disc about its central axis perpendicular to its plane", String.raw`$I=\frac{1}{2}MR^2$`],
  ["Uniform disc about a diameter", String.raw`$I=\frac{1}{4}MR^2$`],
  ["Uniform rod about an axis through its centre perpendicular to its length", String.raw`$I=\frac{1}{12}ML^2$`],
  ["Hollow cylinder about its axis", String.raw`$I=MR^2$`],
  ["Solid cylinder about its axis", String.raw`$I=\frac{1}{2}MR^2$`],
  ["Solid sphere about a diameter", String.raw`$I=\frac{2}{5}MR^2$`],
].forEach(([object, expression]) => addFormula(6, "Standard moments of inertia", object, expression,
  { I: "Moment of inertia about the specified axis", M: "Mass", R: "Radius", L: "Length" },
  { section: "7.9 Moment of inertia; Table 7.1", category: "standard result", importantNote: "CBSE lists these standard values without requiring their derivations.", conditions: "Use the axis named in the result." }));
addFormula(6, "Rigid-body equilibrium", "Conditions for rigid-body equilibrium",
  String.raw`$\sum_i\vec F_i=\vec 0,\quad \sum_i\vec\tau_i=\vec 0$`,
  { "\\vec F_i": "External forces", "\\vec\\tau_i": "External torques about a common origin" },
  { section: "7.8 Equilibrium of a rigid body", conditions: "Both translational and rotational equilibrium are required." });

addContent(7, "Kepler's laws", "law", "Kepler's first law",
  "Planets move in elliptical orbits with the Sun at one focus.",
  { section: "8.2 Kepler’s laws", importance: "high" });
addContent(7, "Kepler's laws", "law", "Kepler's second law",
  "The line joining a planet to the Sun sweeps out equal areas in equal intervals of time.",
  { section: "8.2 Kepler’s laws", importance: "high" });
addFormula(7, "Kepler's laws", "Constant areal velocity",
  String.raw`$\frac{dA}{dt}=\text{constant}$`,
  { A: "Area swept out by the radius vector", t: "Time" },
  { section: "8.2 Kepler’s laws", units: "m² s⁻¹", conditions: "The radius vector sweeps out equal areas in equal time intervals." });
addContent(7, "Kepler's laws", "law", "Kepler's third law",
  "For planets orbiting the same central body, the square of the orbital period is proportional to the cube of the semi-major axis.",
  { section: "8.2 Kepler’s laws", importance: "high" });
addFormula(7, "Kepler's laws", "Kepler's third law for a circular orbit",
  String.raw`$T^2=\frac{4\pi^2}{GM}r^3$`,
  { T: "Orbital period", G: "Universal gravitational constant", M: "Central-body mass", r: "Orbital radius" },
  { section: "8.2 Kepler’s laws", units: "s²", conditions: "Planet or satellite of negligible mass in a circular orbit about a central mass M." });
addFormula(7, "Kepler's laws", "Kepler's third law for elliptical orbits",
  String.raw`$T^2\propto a^3$`,
  { T: "Orbital period", a: "Semi-major axis of the orbit" },
  { section: "8.2 Kepler’s laws", category: "law", conditions: "Compare planets orbiting the same central body." });
addContent(7, "Universal gravitation", "law", "Newton's law of universal gravitation",
  "Every pair of masses attracts with a force along the line joining them, proportional to the product of their masses and inversely proportional to the square of their separation.",
  { section: "8.3 Universal law of gravitation", importance: "high" });
addFormula(7, "Universal gravitation", "Magnitude of gravitational force",
  String.raw`$F=G\frac{m_1m_2}{r^2}$`,
  { F: "Magnitude of gravitational force", G: "Universal gravitational constant", m_1: "First mass", m_2: "Second mass", r: "Separation of mass centres" },
  { section: "8.3 Universal law of gravitation", units: "N", conditions: "Spherically symmetric bodies can be treated as point masses when their separation is measured between centres." });
addFormula(7, "Universal gravitation", "Gravitational field strength of a point mass",
  String.raw`$g(r)=\frac{GM}{r^2}$`,
  { g: "Gravitational acceleration magnitude", G: "Universal gravitational constant", M: "Source mass", r: "Distance from its centre" },
  { section: "8.4 The gravitational constant", units: "m s⁻²", conditions: "Outside a spherically symmetric mass, or for a point mass." });
addFormula(7, "Acceleration due to gravity", "Acceleration due to gravity at a planet's surface",
  String.raw`$g=\frac{GM}{R^2}$`,
  { g: "Surface gravitational acceleration", G: "Universal gravitational constant", M: "Planet mass", R: "Planet radius" },
  { section: "8.5 Acceleration due to gravity of the earth", units: "m s⁻²" });
addFormula(7, "Variation of g", "g at altitude h",
  String.raw`$g_h=g\left(\frac{R}{R+h}\right)^2$`,
  { g_h: "Gravitational acceleration at altitude h", g: "Surface gravitational acceleration", R: "Planet radius", h: "Altitude above the surface" },
  { section: "8.5 Acceleration due to gravity of the earth", units: "m s⁻²", conditions: "Spherically symmetric planet; h is measured from the surface." });
addFormula(7, "Variation of g", "Approximate g at small altitude",
  String.raw`$g_h\approx g\left(1-\frac{2h}{R}\right)$`,
  { g_h: "Gravitational acceleration at altitude h", g: "Surface gravitational acceleration", h: "Altitude", R: "Planet radius" },
  { section: "8.5 Acceleration due to gravity of the earth", units: "m s⁻²", conditions: "First-order approximation valid for h≪R.", verificationStatus: "DERIVED", category: "limiting approximation" });
addFormula(7, "Variation of g", "g at depth d",
  String.raw`$g_d=g\left(1-\frac{d}{R}\right)$`,
  { g_d: "Gravitational acceleration at depth d", g: "Surface gravitational acceleration", d: "Depth below the surface", R: "Planet radius" },
  { section: "8.5 Acceleration due to gravity of the earth", units: "m s⁻²", conditions: "Uniform-density spherical Earth model." });
addFormula(7, "Gravitational potential", "Gravitational potential outside a spherical mass",
  String.raw`$V(r)=-\frac{GM}{r}$`,
  { V: "Gravitational potential per unit mass", G: "Universal gravitational constant", M: "Source mass", r: "Distance from its centre" },
  { section: "8.6 Gravitational potential energy", units: "J kg⁻¹", conditions: "Zero potential is at infinity; outside a spherically symmetric mass." });
addFormula(7, "Gravitational potential", "Potential energy and gravitational potential",
  String.raw`$U=mV$`,
  { U: "Gravitational potential energy", m: "Test mass", V: "Gravitational potential at its position" },
  { section: "8.6 Gravitational potential energy", units: "J", conditions: "Potential is defined relative to the same reference as potential energy." });
addFormula(7, "Gravitational potential energy", "Gravitational potential energy of two masses",
  String.raw`$U(r)=-\frac{Gm_1m_2}{r}$`,
  { U: "Gravitational potential energy", G: "Universal gravitational constant", m_1: "First mass", m_2: "Second mass", r: "Separation of mass centres" },
  { section: "8.6 Gravitational potential energy", units: "J", conditions: "Zero potential energy is defined at infinite separation." });
addFormula(7, "Gravitational potential energy", "Near-surface change in gravitational potential energy",
  String.raw`$\Delta U\approx mgh$`,
  { "\\Delta U": "Change in gravitational potential energy", m: "Mass", g: "Surface gravitational acceleration", h: "Small vertical displacement" },
  { section: "8.6 Gravitational potential energy", units: "J", conditions: "Height difference is small compared with planet radius." });
addFormula(7, "Escape speed", "Escape speed from a spherical body",
  String.raw`$v_e=\sqrt{\frac{2GM}{R}}=\sqrt{2gR}$`,
  { v_e: "Escape speed", G: "Universal gravitational constant", M: "Body mass", R: "Body radius", g: "Surface gravitational acceleration" },
  { section: "8.8 Escape speed", units: "m s⁻¹", conditions: "Neglect air resistance and rotation; escape to infinity with zero residual speed." });
addFormula(7, "Satellites", "Orbital speed of a circular satellite",
  String.raw`$v_o=\sqrt{\frac{GM}{r}}$`,
  { v_o: "Orbital speed", G: "Universal gravitational constant", M: "Central-body mass", r: "Orbital radius from the centre" },
  { section: "8.9 Earth satellites", units: "m s⁻¹", conditions: "Circular orbit; central gravitational force supplies centripetal force." });
addFormula(7, "Satellites", "Orbital period of a circular satellite",
  String.raw`$T=2\pi\sqrt{\frac{r^3}{GM}}$`,
  { T: "Orbital period", r: "Orbital radius", G: "Universal gravitational constant", M: "Central-body mass" },
  { section: "8.9 Earth satellites", units: "s", conditions: "Circular orbit about a body of mass M; satellite mass is negligible relative to M." });
addFormula(7, "Satellites", "Total energy of a circularly orbiting satellite",
  String.raw`$E=-\frac{GMm}{2r}$`,
  { E: "Total orbital mechanical energy", G: "Universal gravitational constant", M: "Central-body mass", m: "Satellite mass", r: "Orbital radius" },
  { section: "8.10 Energy of an orbiting satellite", units: "J", conditions: "Circular orbit; zero potential energy at infinity." });
addFormula(7, "Satellites", "Kinetic energy of a circularly orbiting satellite",
  String.raw`$K=\frac{GMm}{2r}$`,
  { K: "Satellite kinetic energy", G: "Universal gravitational constant", M: "Central-body mass", m: "Satellite mass", r: "Orbital radius" },
  { section: "8.10 Energy of an orbiting satellite", units: "J", conditions: "Circular orbit." });
addFormula(7, "Satellites", "Potential energy of a circularly orbiting satellite",
  String.raw`$U=-\frac{GMm}{r}$`,
  { U: "Gravitational potential energy", G: "Universal gravitational constant", M: "Central-body mass", m: "Satellite mass", r: "Orbital radius" },
  { section: "8.10 Energy of an orbiting satellite", units: "J", conditions: "Zero potential energy is defined at infinite separation." });
addFormula(7, "Universal gravitation", "Universal gravitational constant",
  String.raw`$G\approx6.67\times10^{-11}\ \mathrm{N\,m^2\,kg^{-2}}$`,
  { G: "Universal gravitational constant" },
  { section: "8.4 The gravitational constant", units: "N m² kg⁻²", category: "constant", importance: "high" });
addFormula(7, "Acceleration due to gravity", "Standard gravitational acceleration near Earth's surface",
  String.raw`$g\approx9.8\ \mathrm{m\,s^{-2}}$`,
  { g: "Approximate gravitational acceleration near Earth's surface" },
  { section: "8.5 Acceleration due to gravity of the earth", units: "m s⁻²", category: "constant", conditions: "Approximate value near Earth's surface; it varies with location." });

addContent(8, "Stress and strain", "definition", "Stress",
  "Stress is the internal restoring force per unit area produced in a body by an external force.",
  { section: "9.2 Stress and strain", importance: "high" });
addContent(8, "Stress and strain", "definition", "Strain",
  "Strain is the fractional change in a dimension of a body caused by deformation.",
  { section: "9.2 Stress and strain", importance: "high" });
addContent(8, "Elasticity", "law", "Hooke's law",
  "Within the elastic limit, stress is proportional to strain.",
  { section: "9.3 Hooke’s law", importance: "high" });
addContent(8, "Shear modulus", "fact", "Qualitative scope of shear modulus",
  "The shear modulus of rigidity is included qualitatively only in the CBSE Class XI syllabus; this dataset does not treat its quantitative calculation as required.",
  { section: "9.5 Elastic moduli", source: "CBSE", sourceUrl: CBSE_SYLLABUS_URL, importantNote: "Qualitative idea only; no quantitative formula or derivation added." });
addContent(8, "Elastic behaviour", "fact", "Qualitative applications of elastic behaviour",
  "Applications of elastic behaviour of materials are a qualitative-only syllabus item.",
  { section: "9.6 Applications of elastic behaviour of materials", source: "CBSE", sourceUrl: CBSE_SYLLABUS_URL, importantNote: "Qualitative idea only." });
addFormula(8, "Stress and strain", "Longitudinal stress",
  String.raw`$\sigma=\frac{F}{A}$`,
  { "\\sigma": "Longitudinal stress", F: "Normal force", A: "Cross-sectional area" },
  { section: "9.2 Stress and strain", units: "Pa" });
addFormula(8, "Stress and strain", "Longitudinal strain",
  String.raw`$\epsilon=\frac{\Delta L}{L}$`,
  { "\\epsilon": "Longitudinal strain", "\\Delta L": "Change in length", L: "Original length" },
  { section: "9.2 Stress and strain", units: "Dimensionless" });
addFormula(8, "Young's modulus", "Young's modulus",
  String.raw`$Y=\frac{\text{longitudinal stress}}{\text{longitudinal strain}}=\frac{FL}{A\Delta L}$`,
  { Y: "Young's modulus", F: "Applied normal force", L: "Original length", A: "Cross-sectional area", "\\Delta L": "Change in length" },
  { section: "9.5 Elastic moduli", units: "Pa", conditions: "Small deformation within the linear elastic limit." });
addFormula(8, "Bulk modulus", "Bulk modulus",
  String.raw`$B=-\frac{\Delta p}{\Delta V/V}$`,
  { B: "Bulk modulus", "\\Delta p": "Change in pressure", "\\Delta V": "Change in volume", V: "Original volume" },
  { section: "9.5 Elastic moduli", units: "Pa", conditions: "The minus sign reflects volume decrease under pressure increase." });
addFormula(8, "Poisson's ratio", "Poisson's ratio",
  String.raw`$\nu=-\frac{\text{lateral strain}}{\text{longitudinal strain}}$`,
  { "\\nu": "Poisson's ratio" },
  { section: "9.5 Elastic moduli", units: "Dimensionless" });
addFormula(8, "Elastic energy", "Elastic energy stored in a stretched wire",
  String.raw`$U=\frac{1}{2}F\Delta L=\frac{1}{2}(\text{stress})(\text{strain})V$`,
  { U: "Elastic potential energy", F: "Applied force", "\\Delta L": "Extension", V: "Volume of the deformed material" },
  { section: "9.5 Elastic moduli", units: "J", conditions: "Linear elastic regime; loading is quasistatic." });

addFormula(9, "Pressure", "Pressure",
  String.raw`$p=\frac{F_\perp}{A}$`,
  { p: "Pressure", "F_\\perp": "Normal force", A: "Area" },
  { section: "10.2 Pressure", units: "Pa" });
addFormula(9, "Fluid pressure", "Pressure at depth in a fluid",
  String.raw`$p=p_0+\rho gh$`,
  { p: "Pressure at depth", p_0: "Pressure at the surface", "\\rho": "Fluid density", g: "Gravitational acceleration", h: "Depth below the surface" },
  { section: "10.2 Pressure", units: "Pa", conditions: "Fluid at rest; constant density; g effectively uniform." });
addContent(9, "Pascal's law", "law", "Pascal's law",
  "A pressure change applied to an enclosed fluid at rest is transmitted undiminished to every part of the fluid and the container walls.",
  { section: "10.2 Pressure", importance: "high" });
addFormula(9, "Hydraulic machines", "Hydraulic force multiplication",
  String.raw`$\frac{F_1}{A_1}=\frac{F_2}{A_2}$`,
  { F_1: "Force on the small piston", A_1: "Area of the small piston", F_2: "Force on the large piston", A_2: "Area of the large piston" },
  { section: "10.2 Pressure", conditions: "Ideal hydraulic system; pressure transmission; pistons at the same level or hydrostatic difference negligible." });
addFormula(9, "Viscosity", "Newton's law of viscosity",
  String.raw`$F=\eta A\frac{dv}{dx}$`,
  { F: "Tangential viscous force", "\\eta": "Coefficient of viscosity", A: "Area of fluid layer", dv_dx: "Velocity gradient normal to the layer" },
  { section: "10.5 Viscosity", units: "N", conditions: "Newtonian fluid in laminar shear flow." });
addFormula(9, "Viscosity", "Stokes' law",
  String.raw`$F_{\mathrm{visc}}=6\pi\eta rv$`,
  { "F_{\\mathrm{visc}}": "Viscous drag magnitude", "\\eta": "Coefficient of viscosity", r: "Sphere radius", v: "Sphere speed relative to fluid" },
  { section: "10.5 Viscosity", units: "N", conditions: "Small sphere; slow laminar flow; sphere size small relative to container; Newtonian fluid." });
addFormula(9, "Viscosity", "Terminal speed of a small sphere",
  String.raw`$v_t=\frac{2r^2(\rho_s-\rho_f)g}{9\eta}$`,
  { v_t: "Terminal speed", r: "Sphere radius", "\\rho_s": "Sphere density", "\\rho_f": "Fluid density", g: "Gravitational acceleration", "\\eta": "Coefficient of viscosity" },
  { section: "10.5 Viscosity", units: "m s⁻¹", conditions: "Stokes regime; sphere denser than fluid; buoyancy included; flow is laminar." });
addFormula(9, "Fluid flow", "Equation of continuity",
  String.raw`$\rho A v=\text{constant};\quad A_1v_1=A_2v_2\ \text{for an incompressible fluid}$`,
  { "\\rho": "Fluid density", A: "Cross-sectional area", v: "Flow speed" },
  { section: "10.3 Streamline flow", conditions: "Steady flow; second equality assumes incompressibility." });
addContent(9, "Fluid flow", "definition", "Streamline flow",
  "In steady streamline flow, each fluid element follows a smooth path and the velocity at a point does not change with time.",
  { section: "10.3 Streamline flow" });
addContent(9, "Fluid flow", "definition", "Turbulent flow and critical speed",
  "Turbulent flow is irregular; the critical speed marks the onset of turbulence for the given fluid and flow geometry.",
  { section: "10.3 Streamline flow" });
addContent(9, "Buoyancy", "fact", "Buoyancy (outside this Class XI chapter scope)",
  "Buoyancy and Archimedes' principle are not included in the listed CBSE Class XI Physics 2026–27 topics for Chapter 9; they are not imported as verified Class XI content.",
  { source: "CBSE", sourceUrl: CBSE_SYLLABUS_URL, curriculumScope: "excluded", verificationStatus: "EXCLUDED", importantNote: "Checked because buoyancy appeared in the coverage checklist; not included in this chapter's current CBSE scope." });
addContent(9, "Excluded fluid-flow relationship", "fact", "Quantitative Reynolds-number formula for critical speed",
  "The current Class XI NCERT and CBSE treatment identifies critical speed qualitatively; the Reynolds-number formula is not included in the active inventory.",
  { source: "CBSE", sourceUrl: CBSE_SYLLABUS_URL, curriculumScope: "excluded", verificationStatus: "EXCLUDED", importantNote: "Withheld to avoid adding a formula not supported by the specified Class XI treatment." });
addContent(9, "Bernoulli's principle", "principle", "Bernoulli's theorem",
  "For steady flow of an ideal fluid, pressure energy, kinetic energy, and gravitational potential energy per unit volume sum to a constant along a streamline.",
  { section: "10.4 Bernoulli’s principle", importance: "high" });
addFormula(9, "Bernoulli's principle", "Bernoulli equation",
  String.raw`$p+\frac{1}{2}\rho v^2+\rho gh=\text{constant}$`,
  { p: "Fluid pressure", "\\rho": "Fluid density", v: "Fluid speed", g: "Gravitational acceleration", h: "Height" },
  { section: "10.4 Bernoulli’s principle", units: "Pa", conditions: "Steady, incompressible, non-viscous flow along a streamline." });
addFormula(9, "Bernoulli's principle", "Torricelli's law",
  String.raw`$v=\sqrt{2gh}$`,
  { v: "Efflux speed", g: "Gravitational acceleration", h: "Vertical distance from free surface to outlet" },
  { section: "10.4 Bernoulli’s principle", units: "m s⁻¹", conditions: "Large open tank, small outlet, ideal fluid, both points at atmospheric pressure." });
addContent(9, "Dynamic lift", "principle", "Dynamic lift",
  "In a suitable steady flow, faster-moving fluid has lower pressure; the pressure difference across a surface can therefore produce lift.",
  { section: "10.4 Bernoulli’s principle", importance: "medium" });
addFormula(9, "Surface tension", "Surface tension",
  String.raw`$S=\frac{F}{\ell}$`,
  { S: "Surface tension", F: "Tangential force", "\\ell": "Length over which the force acts" },
  { section: "10.6 Surface tension", units: "N m⁻¹" });
addFormula(9, "Surface energy", "Surface energy change",
  String.raw`$\Delta U=S\,\Delta A$`,
  { "\\Delta U": "Increase in surface energy", S: "Surface tension", "\\Delta A": "Increase in surface area" },
  { section: "10.6 Surface tension", units: "J", conditions: "For a single liquid surface at fixed temperature; a soap film has two surfaces." });
addFormula(9, "Excess pressure", "Excess pressure inside a liquid drop",
  String.raw`$\Delta p=\frac{2S}{r}$`,
  { "\\Delta p": "Inside minus outside pressure", S: "Surface tension", r: "Drop radius" },
  { section: "10.6 Surface tension", units: "Pa", conditions: "Spherical liquid drop with one interface." });
addFormula(9, "Excess pressure", "Excess pressure inside a soap bubble",
  String.raw`$\Delta p=\frac{4S}{r}$`,
  { "\\Delta p": "Inside minus outside pressure", S: "Surface tension", r: "Bubble radius" },
  { section: "10.6 Surface tension", units: "Pa", conditions: "Thin soap bubble with two liquid-air interfaces." });
addFormula(9, "Capillarity", "Capillary rise",
  String.raw`$h=\frac{2S\cos\theta}{\rho gr}$`,
  { h: "Height of liquid rise (negative for depression)", S: "Surface tension", "\\theta": "Angle of contact", "\\rho": "Liquid density", g: "Gravitational acceleration", r: "Capillary radius" },
  { section: "10.6 Surface tension", units: "m", conditions: "Circular capillary tube; tube radius small; static meniscus; liquid wets the wall when cos(theta)>0." });

addFormula(10, "Temperature", "Celsius and kelvin temperature scales",
  String.raw`$T(\mathrm K)=t(^{\circ}\mathrm C)+273.15$`,
  { T: "Absolute temperature", t: "Celsius temperature" },
  { section: "11.3 Measurement of temperature", units: "K", conditions: "Temperature intervals have the same numerical size in kelvins and degrees Celsius." });
addFormula(10, "Temperature", "Celsius and Fahrenheit temperature scales",
  String.raw`$\frac{t_F-32}{180}=\frac{t_C}{100}$`,
  { t_F: "Fahrenheit temperature", t_C: "Celsius temperature" },
  { section: "11.3 Measurement of temperature", conditions: "Temperature points on the Fahrenheit and Celsius scales." });
addFormula(10, "Thermal expansion", "Linear expansion",
  String.raw`$\Delta L=\alpha_l L_0\Delta T$`,
  { "\\Delta L": "Change in length", "\\alpha_l": "Coefficient of linear expansion", L_0: "Initial length", "\\Delta T": "Temperature change" },
  { section: "11.5 Thermal expansion", units: "m", conditions: "Small temperature changes and approximately constant expansion coefficient." });
addFormula(10, "Thermal expansion", "Area expansion",
  String.raw`$\Delta A\approx2\alpha_l A_0\Delta T$`,
  { "\\Delta A": "Change in area", "\\alpha_l": "Coefficient of linear expansion", A_0: "Initial area", "\\Delta T": "Temperature change" },
  { section: "11.5 Thermal expansion", units: "m²", conditions: "Isotropic solid; small expansion; terms quadratic in alpha_l Delta T are neglected." });
addFormula(10, "Thermal expansion", "Volume expansion",
  String.raw`$\Delta V=\alpha_v V_0\Delta T$`,
  { "\\Delta V": "Change in volume", "\\alpha_v": "Coefficient of volume expansion", V_0: "Initial volume", "\\Delta T": "Temperature change" },
  { section: "11.5 Thermal expansion", units: "m³" });
addFormula(10, "Thermal expansion", "Volume and linear expansion coefficients for an isotropic solid",
  String.raw`$\alpha_v\approx3\alpha_l$`,
  { "\\alpha_v": "Coefficient of volume expansion", "\\alpha_l": "Coefficient of linear expansion" },
  { section: "11.5 Thermal expansion", conditions: "Isotropic solid; small expansion; coefficients are approximately constant.", verificationStatus: "DERIVED", category: "derived result" });
addFormula(10, "Thermal expansion", "Volume expansion coefficient of an ideal gas",
  String.raw`$\alpha_v=\frac{1}{T}$`,
  { "\\alpha_v": "Volume expansion coefficient at constant pressure", T: "Absolute temperature" },
  { section: "11.5 Thermal expansion", units: "K⁻¹", conditions: "Ideal gas at constant pressure." });
addFormula(10, "Thermal stress", "Thermal stress in a fully constrained rod",
  String.raw`$\sigma=Y\alpha_l\Delta T$`,
  { "\\sigma": "Magnitude of thermal stress", Y: "Young's modulus", "\\alpha_l": "Coefficient of linear expansion", "\\Delta T": "Temperature change" },
  { section: "11.5 Thermal expansion", units: "Pa", conditions: "Uniform isotropic rod; both ends rigidly constrained; small temperature change within the elastic range.", verificationStatus: "DERIVED", category: "derived result" });
addContent(10, "Thermal expansion", "fact", "Anomalous expansion of water",
  "Between 0 °C and 4 °C, water contracts on heating and expands on cooling; its density is maximum at 4 °C.",
  { section: "11.5 Thermal expansion" });
addFormula(10, "Heat capacity", "Heat capacity",
  String.raw`$C=\frac{Q}{\Delta T}$`,
  { C: "Heat capacity", Q: "Heat supplied", "\\Delta T": "Temperature change" },
  { section: "11.6 Specific heat capacity", units: "J K⁻¹" });
addFormula(10, "Specific heat capacity", "Specific heat capacity",
  String.raw`$c=\frac{Q}{m\Delta T}$`,
  { c: "Specific heat capacity", Q: "Heat supplied", m: "Mass", "\\Delta T": "Temperature change" },
  { section: "11.6 Specific heat capacity", units: "J kg⁻¹ K⁻¹", conditions: "No phase change; heat exchange is assigned to the specified body." });
addContent(10, "Heat and temperature", "definition", "Heat and temperature",
  "Heat is energy transferred because of a temperature difference; temperature characterises thermal state and determines the direction of spontaneous heat transfer.",
  { section: "11.2 Temperature and heat", importance: "high" });
addFormula(10, "Specific heat capacity", "Molar heat capacities at constant pressure and volume",
  String.raw`$C_p=\left(\frac{Q}{n\Delta T}\right)_p,\quad C_V=\left(\frac{Q}{n\Delta T}\right)_V$`,
  { C_p: "Molar heat capacity at constant pressure", C_V: "Molar heat capacity at constant volume", Q: "Heat supplied", n: "Amount of substance", "\\Delta T": "Temperature change" },
  { section: "11.6 Specific heat capacity", units: "J mol⁻¹ K⁻¹" });
addFormula(10, "Calorimetry", "Calorimetry energy balance",
  String.raw`$\sum_i Q_i=0$`,
  { Q_i: "Heat gained or lost by body i" },
  { section: "11.7 Calorimetry", conditions: "Thermally isolated system; include phase changes where applicable." });
addFormula(10, "Latent heat", "Latent heat",
  String.raw`$Q=mL$`,
  { Q: "Heat absorbed or released during the change of state", m: "Mass", L: "Specific latent heat" },
  { section: "11.8 Change of state", units: "J", conditions: "Phase change occurs at the transition temperature and pressure." });
addFormula(10, "Heat conduction", "Heat conduction through a slab",
  String.raw`$\frac{Q}{t}=kA\frac{T_1-T_2}{L}$`,
  { Q: "Heat transferred", t: "Time", k: "Thermal conductivity", A: "Cross-sectional area", T_1: "Hot-face temperature", T_2: "Cold-face temperature", L: "Slab thickness" },
  { section: "11.9 Heat transfer", units: "W", conditions: "Steady one-dimensional conduction through a uniform slab; edge losses neglected." });
addContent(10, "Heat transfer", "definition", "Conduction, convection, and radiation",
  "Conduction transfers energy through microscopic interactions in matter; convection involves bulk fluid motion; radiation transfers energy by electromagnetic waves and requires no material medium.",
  { section: "11.9 Heat transfer", importance: "high" });
addContent(10, "Thermal conductivity", "definition", "Thermal conductivity",
  "Thermal conductivity quantifies a material's ability to conduct heat and appears in the steady one-dimensional conduction relation.",
  { section: "11.9 Heat transfer" });
addContent(10, "Excluded heat-transfer result", "fact", "Newton's law of cooling (outside listed CBSE scope)",
  "The NCERT chapter discusses Newton's law of cooling, but it is not listed in the CBSE Class XI Physics 2026–27 Chapter 10 scope and is not included as a student formula.",
  { source: "CBSE", sourceUrl: CBSE_SYLLABUS_URL, curriculumScope: "excluded", verificationStatus: "EXCLUDED", importantNote: "Explicitly kept out of the active formula inventory after the CBSE syllabus cross-check." });
addContent(10, "Thermal radiation", "fact", "Qualitative scope of thermal radiation laws",
  "Blackbody radiation, Wien's displacement law, and Stefan's law are qualitative-only items in the CBSE Class XI syllabus; quantitative application and derivation are not included here.",
  { source: "CBSE", sourceUrl: CBSE_SYLLABUS_URL, importantNote: "The syllabus specifies qualitative ideas only; no quantitative law formula is supplied." });

addContent(11, "Thermal equilibrium", "law", "Zeroth law of thermodynamics",
  "If two systems are separately in thermal equilibrium with a third system, they are in thermal equilibrium with each other.",
  { section: "12.3 Zeroth law of thermodynamics", importance: "high" });
addContent(11, "First law", "law", "First law of thermodynamics",
  "Heat supplied to a system changes its internal energy and may do work; the sign convention below takes work done by the system as positive.",
  { section: "12.5 First law of thermodynamics", importance: "high" });
addContent(11, "Second law", "law", "Second law of thermodynamics",
  "Heat does not, by itself, flow from a colder body to a hotter body; equivalently, no cyclic engine can convert all absorbed heat completely into work.",
  { section: "12.9 Second law of thermodynamics", importance: "high" });
addFormula(11, "Ideal gas", "Equation of state for an ideal gas",
  String.raw`$pV=nRT=Nk_BT$`,
  { p: "Pressure", V: "Volume", n: "Amount of substance", R: "Molar gas constant", N: "Number of molecules", k_B: "Boltzmann constant", T: "Absolute temperature" },
  { section: "12.7 Thermodynamic state variables and equation of state", units: "J" });
addFormula(11, "First law", "First law with work done by the system positive",
  String.raw`$\Delta Q=\Delta U+W$`,
  { "\\Delta Q": "Heat supplied to the system", "\\Delta U": "Change in internal energy", W: "Work done by the system" },
  { section: "12.5 First law of thermodynamics", units: "J", conditions: "This dataset uses the work-by-system sign convention." });
addFormula(11, "Thermodynamic work", "Quasistatic pressure-volume work",
  String.raw`$W=\int_{V_1}^{V_2}p\,dV$`,
  { W: "Work done by the gas", p: "Pressure during the process", V: "Volume" },
  { section: "12.4 Heat, internal energy and work", units: "J", conditions: "Quasistatic process; work is positive for expansion under the stated convention." });
addFormula(11, "Isochoric process", "Work in an isochoric process",
  String.raw`$W=0$`,
  {},
  { section: "12.8 Thermodynamic processes", conditions: "Volume remains constant." });
addFormula(11, "Isobaric process", "Work in an isobaric process",
  String.raw`$W=p(V_2-V_1)$`,
  { W: "Work done by the gas", p: "Constant pressure", V_1: "Initial volume", V_2: "Final volume" },
  { section: "12.8 Thermodynamic processes", units: "J", conditions: "Pressure remains constant." });
addFormula(11, "Isothermal process", "Ideal-gas isothermal equation",
  String.raw`$pV=\text{constant}$`,
  { p: "Gas pressure", V: "Gas volume" },
  { section: "12.8 Thermodynamic processes", conditions: "Fixed amount of ideal gas at constant absolute temperature." });
addFormula(11, "Isothermal process", "Work in an ideal-gas isothermal process",
  String.raw`$W=nRT\ln\!\left(\frac{V_2}{V_1}\right)$`,
  { W: "Work done by the gas", n: "Amount of gas", R: "Molar gas constant", T: "Constant absolute temperature", V_1: "Initial volume", V_2: "Final volume" },
  { section: "12.8 Thermodynamic processes", units: "J", conditions: "Reversible isothermal change of an ideal gas." });
addFormula(11, "Isothermal process", "Internal-energy change in an ideal-gas isothermal process",
  String.raw`$\Delta U=0$`,
  {},
  { section: "12.8 Thermodynamic processes", conditions: "Ideal gas; temperature is constant." });
addFormula(11, "Adiabatic process", "Reversible adiabatic equation",
  String.raw`$pV^\gamma=\text{constant}$`,
  { p: "Gas pressure", V: "Gas volume", "\\gamma": "Ratio of heat capacities C_p/C_V" },
  { section: "12.8 Thermodynamic processes", conditions: "Reversible adiabatic change of an ideal gas with constant heat capacities." });
addFormula(11, "Adiabatic process", "Reversible adiabatic temperature-volume relation",
  String.raw`$TV^{\gamma-1}=\text{constant}$`,
  { T: "Absolute temperature", V: "Gas volume", "\\gamma": "Ratio of heat capacities C_p/C_V" },
  { section: "12.8 Thermodynamic processes", conditions: "Reversible adiabatic change of an ideal gas with constant heat capacities." });
addFormula(11, "Cyclic process", "Internal-energy change in a cycle",
  String.raw`$\Delta U_{\text{cycle}}=0$`,
  { "\\Delta U_{\\text{cycle}}": "Net internal-energy change after returning to the initial state" },
  { section: "12.8 Thermodynamic processes", conditions: "The system returns to its initial thermodynamic state." });
addFormula(11, "Heat capacities of an ideal gas", "Mayer's relation",
  String.raw`$C_p-C_V=R$`,
  { C_p: "Molar heat capacity at constant pressure", C_V: "Molar heat capacity at constant volume", R: "Molar gas constant" },
  { section: "12.6 Specific heat capacity", units: "J mol⁻¹ K⁻¹", conditions: "Ideal gas; molar heat capacities." });
addContent(11, "Thermodynamic processes", "definition", "Reversible and irreversible processes",
  "A reversible process can be reversed so that both system and surroundings return to their initial states with no other change; real dissipative processes are irreversible.",
  { section: "12.10 Reversible and irreversible processes" });
addFormula(11, "Heat engine", "Thermal efficiency of a heat engine",
  String.raw`$\eta=\frac{W}{Q_H}=1-\frac{Q_C}{Q_H}$`,
  { "\\eta": "Thermal efficiency", W: "Work output per cycle", Q_H: "Heat absorbed from the hot reservoir", Q_C: "Heat rejected to the cold reservoir" },
  { section: "12.11 Carnot engine", units: "Dimensionless", conditions: "Cyclic engine; heat magnitudes are positive.", verificationStatus: "PENDING", importantNote: "NCERT discusses heat engines, but the CBSE 2026–27 chapter list names the second law without separately enumerating engine-efficiency calculations; pending explicit scope confirmation." });
addFormula(11, "Carnot engine", "Carnot efficiency",
  String.raw`$\eta_C=1-\frac{T_C}{T_H}$`,
  { "\\eta_C": "Carnot efficiency", T_C: "Cold-reservoir absolute temperature", T_H: "Hot-reservoir absolute temperature" },
  { section: "12.11 Carnot engine", units: "Dimensionless", conditions: "Reversible engine operating between two thermal reservoirs; temperatures in kelvins.", verificationStatus: "PENDING", importantNote: "NCERT-derived standard result; CBSE 2026–27 does not explicitly name the Carnot cycle, so held pending rather than marked verified." });
addFormula(11, "Refrigerator", "Coefficient of performance of a refrigerator",
  String.raw`$\mathrm{COP}=\frac{Q_C}{W}$`,
  { "\\mathrm{COP}": "Coefficient of performance", Q_C: "Heat extracted from the cold reservoir", W: "Work input" },
  { section: "12.9 Second law of thermodynamics", units: "Dimensionless", conditions: "Cyclic refrigerator; heat and work are magnitudes.", verificationStatus: "PENDING", importantNote: "NCERT discusses the performance limit of a refrigerator, but CBSE 2026–27 does not separately enumerate refrigerator calculations." });

addContent(12, "Kinetic theory assumptions", "fact", "Ideal-gas kinetic-theory assumptions",
  "Gas molecules are treated as identical particles in continuous random motion; intermolecular forces are negligible except during brief elastic collisions; molecular size is negligible compared with the container volume.",
  { section: "13.2 Molecular nature of matter", importance: "high" });
addContent(12, "Equipartition of energy", "law", "Law of equipartition of energy",
  "At thermal equilibrium, energy is shared equally among independent quadratic degrees of freedom; CBSE specifies the law itself as statement-only.",
  { section: "13.5 Law of equipartition of energy", importantNote: "Statement only; no derivation is required by CBSE." });
addFormula(12, "Ideal gas", "Ideal-gas equation",
  String.raw`$pV=Nk_BT=nRT$`,
  { p: "Pressure", V: "Volume", N: "Number of molecules", k_B: "Boltzmann constant", n: "Amount of substance", R: "Molar gas constant", T: "Absolute temperature" },
  { section: "13.3 Kinetic theory of an ideal gas", units: "J" });
addFormula(12, "Kinetic pressure", "Kinetic-theory pressure relation",
  String.raw`$p=\frac{1}{3}\rho\langle c^2\rangle=\frac{1}{3}\rho c_{\mathrm{rms}}^2$`,
  { p: "Gas pressure", "\\rho": "Gas density", "\\langle c^2\\rangle": "Mean square molecular speed", "c_{\\mathrm{rms}}": "Root-mean-square molecular speed" },
  { section: "13.4 Kinetic theory of an ideal gas", units: "Pa" });
addFormula(12, "Kinetic interpretation of temperature", "Mean translational kinetic energy per molecule",
  String.raw`$\left\langle K_{\text{trans}}\right\rangle=\frac{3}{2}k_BT$`,
  { "\\left\\langle K_{\\text{trans}}\\right\\rangle": "Mean translational kinetic energy per molecule", k_B: "Boltzmann constant", T: "Absolute temperature" },
  { section: "13.4 Kinetic interpretation of temperature", units: "J" });
addFormula(12, "Root-mean-square speed", "RMS speed of gas molecules",
  String.raw`$c_{\mathrm{rms}}=\sqrt{\frac{3k_BT}{m}}=\sqrt{\frac{3RT}{M}}$`,
  { "c_{\\mathrm{rms}}": "Root-mean-square molecular speed", k_B: "Boltzmann constant", T: "Absolute temperature", m: "Mass of one molecule", R: "Molar gas constant", M: "Molar mass" },
  { section: "13.4 Kinetic interpretation of temperature", units: "m s⁻¹" });
addFormula(12, "Degrees of freedom", "Mean energy for f quadratic degrees of freedom",
  String.raw`$\langle E\rangle=\frac{f}{2}k_BT$`,
  { "\\langle E\\rangle": "Mean energy per molecule", f: "Number of active quadratic degrees of freedom", k_B: "Boltzmann constant", T: "Absolute temperature" },
  { section: "13.5 Law of equipartition of energy", conditions: "Use as the stated equipartition result; no derivation included." });
addFormula(12, "Heat capacities of gases", "Molar heat capacities for an ideal gas with f degrees of freedom",
  String.raw`$C_V=\frac{f}{2}R,\quad C_p=C_V+R,\quad\gamma=\frac{C_p}{C_V}$`,
  { C_V: "Molar heat capacity at constant volume", C_p: "Molar heat capacity at constant pressure", f: "Active degrees of freedom", R: "Molar gas constant", "\\gamma": "Heat-capacity ratio" },
  { section: "13.6 Specific heat capacity", units: "J mol⁻¹ K⁻¹ for C_V and C_p; dimensionless for gamma", conditions: "Ideal gas; equipartition applied to active quadratic degrees of freedom." });
addFormula(12, "Mean free path", "Mean free path for hard-sphere molecules",
  String.raw`$\lambda=\frac{1}{\sqrt{2}\pi d^2 n_v}$`,
  { "\\lambda": "Mean free path", d: "Molecular diameter", n_v: "Number of molecules per unit volume" },
  { section: "13.7 Mean free path", units: "m", conditions: "Dilute gas model of identical hard-sphere molecules." });
addFormula(12, "Avogadro constant", "Avogadro constant",
  String.raw`$N_A\approx6.02\times10^{23}\ \mathrm{mol^{-1}}$`,
  { N_A: "Number of constituent entities per mole" },
  { section: "13.2 Molecular nature of matter", units: "mol⁻¹", category: "constant" });
addFormula(12, "Ideal gas", "Molar gas constant",
  String.raw`$R\approx8.31\ \mathrm{J\,mol^{-1}\,K^{-1}}$`,
  { R: "Molar gas constant" },
  { section: "13.3 Behaviour of gases", units: "J mol⁻¹ K⁻¹", category: "constant" });
addFormula(12, "Boltzmann constant", "Boltzmann constant",
  String.raw`$k_B=\frac{R}{N_A}\approx1.38\times10^{-23}\ \mathrm{J\,K^{-1}}$`,
  { k_B: "Boltzmann constant", R: "Molar gas constant", N_A: "Avogadro constant" },
  { section: "13.4 Kinetic interpretation of temperature", units: "J K⁻¹", category: "constant" });

addContent(13, "Periodic motion", "definition", "Periodic motion",
  "Motion that repeats itself after equal intervals of time.",
  { section: "14.2 Periodic and oscillatory motions", importance: "high" });
addContent(13, "Simple harmonic motion", "definition", "Simple harmonic motion",
  "Oscillatory motion in which acceleration is proportional to displacement from the equilibrium position and directed toward that position.",
  { section: "14.3 Simple harmonic motion", importance: "high" });
addContent(13, "Phase", "definition", "Phase of an oscillator",
  "The phase specifies the state of an oscillator at a given time; it is represented by the argument of the sinusoidal displacement function.",
  { section: "14.3 Simple harmonic motion" });
addFormula(13, "Periodic motion", "Frequency and period",
  String.raw`$f=\frac{1}{T}$`,
  { f: "Frequency", T: "Time period" },
  { section: "14.2 Periodic and oscillatory motions", units: "Hz" });
addFormula(13, "Simple harmonic motion", "Angular frequency",
  String.raw`$\omega=2\pi f=\frac{2\pi}{T}$`,
  { "\\omega": "Angular frequency", f: "Frequency", T: "Time period" },
  { section: "14.3 Simple harmonic motion", units: "rad s⁻¹" });
addFormula(13, "Simple harmonic motion", "Displacement in SHM",
  String.raw`$x=A\cos(\omega t+\phi)$`,
  { x: "Displacement from equilibrium", A: "Amplitude", "\\omega": "Angular frequency", t: "Time", "\\phi": "Initial phase" },
  { section: "14.3 Simple harmonic motion", units: "m", conditions: "One-dimensional SHM; phase convention may equivalently use a sine function." });
addFormula(13, "Simple harmonic motion", "Velocity in SHM",
  String.raw`$v=-A\omega\sin(\omega t+\phi),\quad v^2=\omega^2(A^2-x^2)$`,
  { v: "Instantaneous velocity", A: "Amplitude", "\\omega": "Angular frequency", t: "Time", "\\phi": "Initial phase", x: "Displacement from equilibrium" },
  { section: "14.5 Velocity and acceleration in simple harmonic motion", units: "m s⁻¹" });
addFormula(13, "Simple harmonic motion", "Acceleration in SHM",
  String.raw`$a=-\omega^2x$`,
  { a: "Acceleration", "\\omega": "Angular frequency", x: "Displacement from equilibrium" },
  { section: "14.5 Velocity and acceleration in simple harmonic motion", units: "m s⁻²" });
addFormula(13, "Simple harmonic motion", "Maximum speed in SHM",
  String.raw`$v_{\max}=A\omega$`,
  { "v_{\\max}": "Maximum speed", A: "Amplitude", "\\omega": "Angular frequency" },
  { section: "14.5 Velocity and acceleration in simple harmonic motion", units: "m s⁻¹", category: "standard result" });
addFormula(13, "Simple harmonic motion", "Maximum acceleration in SHM",
  String.raw`$a_{\max}=A\omega^2$`,
  { "a_{\\max}": "Maximum acceleration magnitude", A: "Amplitude", "\\omega": "Angular frequency" },
  { section: "14.5 Velocity and acceleration in simple harmonic motion", units: "m s⁻²", category: "standard result" });
addFormula(13, "Spring-mass oscillator", "Spring-mass angular frequency",
  String.raw`$\omega=\sqrt{\frac{k}{m}}$`,
  { "\\omega": "Angular frequency", k: "Spring constant", m: "Oscillating mass" },
  { section: "14.6 Force law for simple harmonic motion", units: "rad s⁻¹", conditions: "Ideal spring; small oscillations about equilibrium." });
addFormula(13, "Spring-mass oscillator", "Hooke restoring force",
  String.raw`$F=-kx$`,
  { F: "Restoring force", k: "Spring constant", x: "Displacement from equilibrium" },
  { section: "14.6 Force law for simple harmonic motion", units: "N", conditions: "Ideal spring within its linear elastic range; the minus sign indicates a force toward equilibrium." });
addFormula(13, "Spring-mass oscillator", "Spring-mass time period",
  String.raw`$T=2\pi\sqrt{\frac{m}{k}}$`,
  { T: "Time period", m: "Oscillating mass", k: "Spring constant" },
  { section: "14.6 Force law for simple harmonic motion", units: "s", conditions: "Ideal spring; small oscillations about equilibrium." });
addFormula(13, "Simple pendulum", "Time period of a simple pendulum",
  String.raw`$T=2\pi\sqrt{\frac{\ell}{g}}$`,
  { T: "Time period", "\\ell": "Pendulum length", g: "Acceleration due to gravity" },
  { section: "14.8 The simple pendulum", units: "s", conditions: "Small angular displacement; light inextensible string; point-mass bob." });
addFormula(13, "SHM energy", "Total energy in SHM",
  String.raw`$E=\frac{1}{2}m\omega^2A^2=\frac{1}{2}kA^2$`,
  { E: "Total mechanical energy", m: "Oscillating mass", "\\omega": "Angular frequency", A: "Amplitude", k: "Restoring-force constant" },
  { section: "14.7 Energy in simple harmonic motion", units: "J", conditions: "Ideal undamped SHM; for a spring oscillator, k=m omega squared." });
addFormula(13, "SHM energy", "Kinetic energy in SHM",
  String.raw`$K=\frac{1}{2}m\omega^2(A^2-x^2)$`,
  { K: "Kinetic energy", m: "Oscillating mass", "\\omega": "Angular frequency", A: "Amplitude", x: "Displacement from equilibrium" },
  { section: "14.7 Energy in simple harmonic motion", units: "J" });
addFormula(13, "SHM energy", "Potential energy in SHM",
  String.raw`$U=\frac{1}{2}m\omega^2x^2$`,
  { U: "Potential energy relative to equilibrium", m: "Oscillating mass", "\\omega": "Angular frequency", x: "Displacement from equilibrium" },
  { section: "14.7 Energy in simple harmonic motion", units: "J" });

addFormula(14, "Progressive waves", "Wave speed, frequency, and wavelength",
  String.raw`$v=f\lambda=\frac{\omega}{k}$`,
  { v: "Wave speed", f: "Frequency", "\\lambda": "Wavelength", "\\omega": "Angular frequency", k: "Wave number" },
  { section: "15.4 The speed of a travelling wave", units: "m s⁻¹" });
addFormula(14, "Progressive waves", "Angular frequency and frequency",
  String.raw`$\omega=2\pi f$`,
  { "\\omega": "Angular frequency", f: "Frequency" },
  { section: "15.4 The speed of a travelling wave", units: "rad s⁻¹" });
addFormula(14, "Progressive waves", "Wave number",
  String.raw`$k=\frac{2\pi}{\lambda}$`,
  { k: "Wave number", "\\lambda": "Wavelength" },
  { section: "15.4 The speed of a travelling wave", units: "m⁻¹" });
addFormula(14, "Progressive waves", "Progressive wave travelling in the positive x-direction",
  String.raw`$y(x,t)=A\sin(kx-\omega t+\phi)$`,
  { y: "Transverse displacement", A: "Amplitude", k: "Wave number", x: "Position", "\\omega": "Angular frequency", t: "Time", "\\phi": "Initial phase" },
  { section: "15.3 Displacement relation in a progressive wave", units: "m", conditions: "Sinusoidal wave; positive x-direction; phase convention may use an equivalent cosine." });
addFormula(14, "Progressive waves", "Phase difference between two points",
  String.raw`$\Delta\phi=\frac{2\pi\Delta x}{\lambda}$`,
  { "\\Delta\\phi": "Phase difference", "\\Delta x": "Separation along direction of propagation", "\\lambda": "Wavelength" },
  { section: "15.3 Displacement relation in a progressive wave", units: "rad" });
addContent(14, "Wave types", "definition", "Transverse and longitudinal waves",
  "In a transverse wave, particle displacement is perpendicular to propagation; in a longitudinal wave, particle displacement is parallel to propagation.",
  { section: "15.2 Transverse and longitudinal waves", importance: "high" });
addContent(14, "Standing waves", "definition", "Standing wave",
  "A standing wave is a stationary interference pattern with fixed nodes and antinodes, formed by superposition of waves travelling in opposite directions.",
  { section: "15.6 Reflection of waves" });
addContent(14, "Reflection of waves", "fact", "Reflection at fixed and free ends",
  "A reflected transverse pulse is inverted at a fixed end and is not inverted at a free end.",
  { section: "15.6 Reflection of waves" });
addContent(14, "Superposition", "principle", "Principle of superposition of waves",
  "When waves overlap in a linear medium, the resultant displacement at a point is the algebraic sum of the displacements due to the individual waves.",
  { section: "15.5 The principle of superposition of waves", importance: "high" });
addFormula(14, "Waves on a stretched string", "Wave speed on a stretched string",
  String.raw`$v=\sqrt{\frac{\mathcal T}{\mu}}$`,
  { v: "Wave speed", "\\mathcal T": "String tension", "\\mu": "Mass per unit length" },
  { section: "15.4 The speed of a travelling wave", units: "m s⁻¹", conditions: "Uniform flexible string under tension." });
addFormula(14, "Standing waves", "Standing wave from equal counter-propagating waves",
  String.raw`$y=2A\sin(kx)\cos(\omega t)$`,
  { y: "Resultant displacement", A: "Amplitude of each travelling wave", k: "Wave number", x: "Position", "\\omega": "Angular frequency", t: "Time" },
  { section: "15.6 Reflection of waves", conditions: "Two equal-amplitude sinusoidal waves of equal frequency travelling in opposite directions." });
addFormula(14, "Standing waves on a string", "Allowed frequencies for a string fixed at both ends",
  String.raw`$f_n=\frac{nv}{2L},\quad n=1,2,3,\ldots$`,
  { f_n: "Frequency of the n-th mode", n: "Positive integer harmonic number", v: "Wave speed on string", L: "String length" },
  { section: "15.6 Reflection of waves", units: "Hz", conditions: "Uniform string fixed at both ends; ideal transverse waves." });
addFormula(14, "Organ pipes", "Fundamental and harmonics of an open pipe",
  String.raw`$f_n=\frac{nv}{2L},\quad n=1,2,3,\ldots$`,
  { f_n: "Frequency of the n-th mode", n: "Positive integer harmonic number", v: "Sound speed", L: "Pipe length" },
  { section: "15.6 Reflection of waves", units: "Hz", conditions: "Open at both ends; ideal pipe; end correction neglected." });
addFormula(14, "Organ pipes", "Fundamental and harmonics of a closed pipe",
  String.raw`$f_n=\frac{(2n-1)v}{4L},\quad n=1,2,3,\ldots$`,
  { f_n: "Frequency of the n-th mode", n: "Positive integer mode index", v: "Sound speed", L: "Pipe length" },
  { section: "15.6 Reflection of waves", units: "Hz", conditions: "Closed at one end and open at the other; ideal pipe; end correction neglected. Only odd harmonics occur." });
addFormula(14, "Beats", "Beat frequency",
  String.raw`$f_{\text{beat}}=|f_1-f_2|$`,
  { "f_{\\text{beat}}": "Number of beats per second", f_1: "First frequency", f_2: "Second frequency" },
  { section: "15.7 Beats", units: "Hz", conditions: "Two sound waves with close frequencies superpose." });

const ids = new Set();
for (const record of records) {
  if (ids.has(record.id)) throw new Error(`Duplicate Class XI Physics content ID: ${record.id}`);
  ids.add(record.id);
  if (record.type === "formula" && !record.expression) {
    throw new Error(`Physics formula "${record.id}" has no expression.`);
  }
}

for (const record of records.filter((item) => item.type === "formula")) {
  record.relatedFormulas = records
    .filter((candidate) =>
      candidate.type === "formula" &&
      candidate.chapterNumber === record.chapterNumber &&
      candidate.concept === record.concept &&
      candidate.id !== record.id
    )
    .map(({ id, name }) => ({ id, name }));
}

export const class11PhysicsContentRecords = records;
