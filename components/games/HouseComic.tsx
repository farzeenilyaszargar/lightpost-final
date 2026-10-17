const jokes = [
  {
    title: "The Evening Edition",
    lines: [
      "Anything new in the paper?",
      "Only the date. I’m still finishing yesterday’s crossword.",
    ],
    caption: "Some readers prefer their news well aged.",
  },
  {
    title: "The Modern Correspondent",
    lines: [
      "The news now travels at the speed of light!",
      "And yet my tea insists on taking five minutes.",
    ],
    caption: "Progress has its limits.",
  },
  {
    title: "A Matter of Perspective",
    lines: ["The editor says we need a fresh angle.", "Shall I turn the desk?"],
    caption: "A thoroughly practical newsroom.",
  },
];
export default function HouseComic({ index }: { index: number }) {
  const joke = jokes[index % jokes.length];
  return (
    <article className="house-comic">
      <p className="amusement-kicker">FROM THE LIGHTPOST SKETCHBOOK</p>
      <h2>{joke.title}</h2>
      <div className="comic-panels">
        {joke.lines.map((line, i) => (
          <div className="comic-drawing" key={line}>
            <p>{line}</p>
            <svg
              viewBox="0 0 220 170"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <path d="M15 151h190M42 150V99h40v51M119 150v-48h49v48M30 99h64M106 102h76M45 114l21 18M78 115l-13 17M128 117l21 18M163 117l-14 18" />
              <circle cx="62" cy="63" r="15" />
              <circle cx="146" cy="67" r="15" />
              <path
                d={
                  i === 0
                    ? "M48 52h30M52 48v-14h22v14M50 78l-11 21M73 78l13 21M135 81l-18 20M157 81l14 20M132 56l15-8 15 10"
                    : "M48 52h30M52 48V34h22v14M50 78l-11 21M73 78l13 21M135 81l-18 20M157 81l14 20M125 52h41M136 48V34h22v14"
                }
              />
              <path d="M171 117l22-6v27l-21 5zM179 118l10-2M179 123l10-2M179 128l10-2M66 142l-9 9M140 143l-10 8M152 143l10 8" />
            </svg>
          </div>
        ))}
      </div>
      <p className="comic-caption">{joke.caption}</p>
    </article>
  );
}
