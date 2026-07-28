import { AGENTES_STACK, AGENTES_STACK_CLOSING } from "./data";

/** Grid de nombres del stack en monoespaciada, sin logos. */
export default function StackGrid() {
  return (
    <div>
      <ul className="agentes-stack" aria-label="Stack del programa">
        {AGENTES_STACK.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <p className="agentes-stack-closing">{AGENTES_STACK_CLOSING}</p>
    </div>
  );
}
