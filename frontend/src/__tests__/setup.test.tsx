import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

function Contador() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>Cliques: {n}</button>;
}

describe("ambiente de testes do frontend", () => {
  it("renderiza e reage a cliques", async () => {
    render(<Contador />);

    const botao = screen.getByRole("button", { name: "Cliques: 0" });
    await userEvent.click(botao);

    expect(botao).toHaveTextContent("Cliques: 1");
  });
});