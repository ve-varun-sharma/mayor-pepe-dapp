import { FlipText } from "@/components/magicui/flip-text";

export function PageSubheader() {
  return (
    <header className="flex flex-row items-center text-white">
      <div className="coin-container mr-4">
        <svg
          width="150"
          height="150"
          viewBox="0 0 100 100"
          className="coin-float"
          style={{
            filter: "drop-shadow(0px 0px 12px rgba(255, 215, 0, 0.5))",
            transition: "all 0.3s ease",
          }}
        >
          <defs>
            <linearGradient
              id="goldGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                style={{ stopColor: "#FFD700", stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "#D4AF37", stopOpacity: 1 }}
              />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="url(#goldGradient)"
            stroke="#C5A942"
            strokeWidth="3"
          />
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="transparent"
            stroke="#FFE55C"
            strokeWidth="2"
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#FFF"
            fontSize="18"
            fontFamily="Times New Roman, serif"
            fontWeight="bold"
            letterSpacing="0.5"
            style={{
              fontVariant: "small-caps",
              textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)",
            }}
          >
            $MAYOR
          </text>
        </svg>
      </div>
      <FlipText
        className="text-4xl font-bold -tracking-widest text-white md:text-7xl md:leading-[5rem]"
        word="Mint Mayor Pepe"
      />
    </header>
  );
}
