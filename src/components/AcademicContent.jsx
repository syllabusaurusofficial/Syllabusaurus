import MathText from "./MathText";

function VerificationBadge({ source, sourceReference, sourceUrl, status }) {
  const normalizedStatus = (status || "pending").toLowerCase();
  const label = {
    verified: "Verified",
    derived: "Derived",
    pending: "Pending verification",
    draft: "Draft",
    excluded: "Excluded",
  }[normalizedStatus] || "Pending verification";
  return (
    <div className="academic-provenance">
      <span className={`verification-badge verification-${normalizedStatus}`}>
        {label}
      </span>
      <span>{source || "Source not supplied"}</span>
      {sourceReference && (
        <p className="academic-source-reference">
          {sourceUrl
            ? <a href={sourceUrl} target="_blank" rel="noreferrer">{sourceReference}</a>
            : sourceReference}
        </p>
      )}
    </div>
  );
}

function ContentCard({ item, className, heading, children }) {
  return (
    <article className={`academic-content-card ${className}`}>
      <header>
        <h3>{heading || item.name || item.title || item.type}</h3>
        <VerificationBadge
          source={item.source}
          sourceReference={item.sourceReference}
          sourceUrl={item.sourceUrl}
          status={item.verificationStatus}
        />
      </header>
      {children}
    </article>
  );
}

function TextContentCard({ item, title, className, body }) {
  return (
    <ContentCard item={item} className={className} heading={title}>
      <p>{body || item.explanation || item.statement || item.text || "No content supplied."}</p>
    </ContentCard>
  );
}

function toList(value) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function toDisplayText(value) {
  if (typeof value === "string") return value;
  return value?.name || value?.text || value?.explanation || value?.id || "Details not supplied.";
}

export function FormulaCard({ formula }) {
  const variables = formula.variables || formula.variableMeanings || {};
  const variableEntries = Object.entries(variables);
  const units = formula.units || formula.unit;
  const mistakes = toList(formula.commonMistakes || formula.commonMistake);
  const related = toList(formula.relatedConcepts);
  const examples = toList(formula.examples);

  return (
    <ContentCard item={formula} className="formula-card" heading={formula.name}>
      <div className="formula-expression" aria-label={`Formula: ${formula.name}`}>
        <MathText text={formula.expression || "No expression supplied."} />
      </div>
      <section className="formula-detail">
        <h4>Variable meanings</h4>
        {variableEntries.length > 0 ? (
          <dl>
            {variableEntries.map(([symbol, value]) => {
              const meaning = typeof value === "string" ? value : value?.meaning;
              const unit = typeof value === "object" ? value?.unit : null;
              const displaySymbol = /^\$/.test(symbol)
                ? symbol
                : /\s/.test(symbol) ? symbol : `$${symbol}$`;
              return (
                <div key={symbol}>
                  <dt><MathText text={displaySymbol} /></dt>
                  <dd>{meaning || "Meaning not supplied"}{unit ? ` (${unit})` : ""}</dd>
                </div>
              );
            })}
          </dl>
        ) : <p>Not supplied.</p>}
      </section>
      {(formula.note || formula.importantNote) && (
        <section className="formula-detail formula-note">
          <h4>Note</h4>
          <p>{formula.note || formula.importantNote}</p>
        </section>
      )}
      <div className="formula-meta-grid">
        <section className="formula-detail">
          <h4>Units</h4>
          <p>{typeof units === "string" ? units || "Not supplied" : JSON.stringify(units)}</p>
        </section>
        <section className="formula-detail">
          <h4>Conditions</h4>
          <p>{formula.conditions || "Not supplied"}</p>
        </section>
        <section className="formula-detail">
          <h4>Importance</h4>
          <p>{formula.importance || "Not supplied"}</p>
        </section>
        <section className="formula-detail">
          <h4>Category</h4>
          <p>{formula.category || "Not supplied"}</p>
        </section>
      </div>
      {mistakes.length > 0 && (
        <section className="formula-detail">
          <h4>Common mistake</h4>
          <ul>{mistakes.map((mistake, index) => <li key={`${index}-${toDisplayText(mistake)}`}>{toDisplayText(mistake)}</li>)}</ul>
        </section>
      )}
      {formula.relatedFormulas?.length > 0 && (
        <section className="formula-detail">
          <h4>Related formulas</h4>
          <ul>{formula.relatedFormulas.map((relatedFormula, index) => (
            <li key={`${index}-${toDisplayText(relatedFormula)}`}>{toDisplayText(relatedFormula)}</li>
          ))}</ul>
        </section>
      )}
      {related.length > 0 && (
        <section className="formula-detail">
          <h4>Related concepts</h4>
          <ul>{related.map((concept, index) => (
            <li key={`${index}-${toDisplayText(concept)}`}>{toDisplayText(concept)}</li>
          ))}</ul>
        </section>
      )}
      {examples.length > 0 && (
        <section className="formula-detail">
          <h4>Examples</h4>
          <ul>{examples.map((example, index) => (
            <li key={`${index}-${toDisplayText(example)}`}>{toDisplayText(example)}</li>
          ))}</ul>
        </section>
      )}
    </ContentCard>
  );
}

export function ChemistryFormulaGroups({ formulas }) {
  const sections = new Map();
  for (const formula of formulas) {
    const chapters = sections.get(formula.section) || new Map();
    const concepts = chapters.get(formula.chapter) || new Map();
    const conceptFormulas = concepts.get(formula.concept) || [];
    conceptFormulas.push(formula);
    concepts.set(formula.concept, conceptFormulas);
    chapters.set(formula.chapter, concepts);
    sections.set(formula.section, chapters);
  }

  return [...sections].map(([section, chapters]) => (
    <section className="formula-section-group" key={section}>
      <h3>{section}</h3>
      {[...chapters].map(([chapter, concepts]) => (
        <section className="formula-chapter-group" key={`${section}-${chapter}`}>
          <h4>{chapter}</h4>
          {[...concepts].map(([concept, conceptFormulas]) => (
            <section className="formula-concept-group" key={`${chapter}-${concept}`}>
              {concept !== chapter && <h5>{concept}</h5>}
              {conceptFormulas.map((formula) => (
                <FormulaCard key={formula.id} formula={formula} />
              ))}
            </section>
          ))}
        </section>
      ))}
    </section>
  ));
}

export function DefinitionCard({ item }) {
  return <TextContentCard item={item} title="Definition" className="definition-card" />;
}

export function LawCard({ item }) {
  return <TextContentCard item={item} title={item.name || "Law"} className="law-card" body={item.statement} />;
}

export function ExampleCard({ item }) {
  return <TextContentCard item={item} title={item.name || "Example"} className="example-card" body={item.solution || item.text} />;
}

export function ImportantFactCard({ item }) {
  return <TextContentCard item={item} title={item.name || "Important fact"} className="fact-card" />;
}

export function CommonMistakeCard({ item }) {
  return <TextContentCard item={item} title={item.name || "Common mistake"} className="mistake-content-card" />;
}

export function UnitCard({ item }) {
  return <TextContentCard item={item} title={item.name || "Unit"} className="unit-card" body={item.symbol ? `${item.symbol} — ${item.meaning || item.text || ""}` : item.meaning || item.text} />;
}

export function AcademicContentCard({ item }) {
  switch (item.type) {
    case "formula":
      return <FormulaCard formula={item} />;
    case "definition":
      return <DefinitionCard item={item} />;
    case "law":
    case "theorem":
    case "principle":
      return <LawCard item={item} />;
    case "example":
      return <ExampleCard item={item} />;
    case "fact":
      return <ImportantFactCard item={item} />;
    case "common_mistake":
      return <CommonMistakeCard item={item} />;
    case "unit":
      return <UnitCard item={item} />;
    default:
      return <TextContentCard item={item} title={item.name} className="generic-content-card" />;
  }
}

export function ConceptCard({ concept }) {
  return (
    <article className="structured-concept-card">
      <header>
        <span className="structured-concept-label">{concept.type === "sub_concept" ? "Sub-concept" : "Concept"}</span>
        <h3>{concept.name}</h3>
      </header>
      {concept.content.map((item) => <AcademicContentCard item={item} key={item.id} />)}
      {concept.children.map((child) => <ConceptCard concept={child} key={child.id} />)}
    </article>
  );
}
