export default function GameIllustration({ kind }: { kind: string }) {
  return (
    <div className={`game-engraving engraving-${kind}`} aria-hidden="true">
      {kind === "sudoku" ? (
        <div className="mini-sudoku">
          {"530070000600195000098000060800060003400803001700020006060000280000419005000080079"
            .split("")
            .map((c, i) => (
              <span key={i}>{c === "0" ? "" : c}</span>
            ))}
        </div>
      ) : kind === "word" ? (
        <div className="mini-word">
          <span>THE PRESS</span>
          <strong>I N _ _ I R Y</strong>
          <small>Seven letters. A curious pursuit.</small>
        </div>
      ) : kind === "math" ? (
        <div className="mini-math">
          <span>
            7 × 8 = <i>?</i>
          </span>
          <small>12 + □ = 25</small>
        </div>
      ) : kind === "sliding" ? (
        <div className="mini-tiles">
          {[1, 2, 3, 4, 0, 6, 7, 5, 8].map((n, i) => (
            <span key={i} className={n === 0 ? "empty" : ""}>
              {n || ""}
            </span>
          ))}
        </div>
      ) : kind === "chess" ? (
        <div className="mini-chess">
          <span>♞</span>
          <div>♟ ♟ ♟ ♟ ♟</div>
        </div>
      ) : (
        <svg
          viewBox="0 0 240 140"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M30 119h180M55 119V83h49v36M122 119V77h53v42M60 84l18-22 25 22M128 78l18-23 26 23M76 62V42m70 13V35" />
          <circle cx="76" cy="32" r="10" />
          <circle cx="146" cy="25" r="10" />
          <path d="M85 38l28 10-8 23-25-9M155 31l24 15-17 24-22-11M99 44l9-14 13 5M178 47l17-15M188 23l15 17M49 13h65v19H89l-8 9V32H49z" />
          <path d="M55 20h46M55 25h31" />
        </svg>
      )}
    </div>
  );
}
