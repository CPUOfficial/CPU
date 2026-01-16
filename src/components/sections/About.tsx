export default function About() {
  return (
    <div className="space-y-4">
      <div className="doom-panel-dark">
        <div className="doom-header">
          <span>PROTOCOL SPECIFICATION</span>
        </div>
        <div className="space-y-4 text-gray-100">
          <p className="leading-relaxed text-lg">
            ▸ CPU is an autonomous token generation and deployment system
            operating on Pump.fun infrastructure. The protocol executes without human
            intervention, utilizing AI-driven decision making for token creation and
            market deployment timing.
          </p>
          <p className="leading-relaxed text-lg">
            ▸ Token generation focuses on computer science and technology themed assets.
            All creator rewards are automatically routed to protocol treasury for
            self-sustaining operation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="doom-panel-dark">
          <div className="doom-header">
            <span>EXECUTION PIPELINE</span>
          </div>
          <div className="space-y-4 text-gray-100">
            <div className="flex items-start gap-3">
              <span className="doom-badge-warning flex-shrink-0 text-lg">STAGE 1</span>
              <span className="leading-relaxed text-lg">Autonomous scheduling determines optimal deployment windows</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="doom-badge-warning flex-shrink-0 text-lg">STAGE 2</span>
              <span className="leading-relaxed text-lg">AI engine generates token metadata using language models</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="doom-badge-warning flex-shrink-0 text-lg">STAGE 3</span>
              <span className="leading-relaxed text-lg">Automated deployment to Pump.fun platform</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="doom-badge-warning flex-shrink-0 text-lg">STAGE 4</span>
              <span className="leading-relaxed text-lg">Creator rewards redirect to protocol wallet</span>
            </div>
          </div>
        </div>

        <div className="doom-panel-dark">
          <div className="doom-header">
            <span>SYSTEM ARCHITECTURE</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-100 border-b-2 border-gray-700 pb-2 text-lg">
              <span>▸ AI Core:</span>
              <span className="text-cyan-400 font-bold doom-glow">Claude API</span>
            </div>
            <div className="flex justify-between text-gray-100 border-b-2 border-gray-700 pb-2 text-lg">
              <span>▸ Database:</span>
              <span className="text-cyan-400 font-bold doom-glow">PostgreSQL</span>
            </div>
            <div className="flex justify-between text-gray-100 border-b-2 border-gray-700 pb-2 text-lg">
              <span>▸ Deployment:</span>
              <span className="text-cyan-400 font-bold doom-glow">Pump.fun</span>
            </div>
            <div className="flex justify-between text-gray-100 border-b-2 border-gray-700 pb-2 text-lg">
              <span>▸ Theme:</span>
              <span className="text-cyan-400 font-bold doom-glow">Computer Science</span>
            </div>
            <div className="flex justify-between text-gray-100 text-lg">
              <span>▸ Human Control:</span>
              <span className="text-red-400 font-bold doom-glow">NONE REQUIRED</span>
            </div>
          </div>
        </div>
      </div>

      <div className="doom-panel-dark">
        <div className="doom-header">
          <span>OPERATIONAL NARRATIVE</span>
        </div>
        <div className="space-y-4 text-gray-100">
          <p className="leading-relaxed text-lg">
            ▸ CPU operates as a self-directed agent in the token economy.
            Decision-making is algorithmic. Execution is automated. Market
            interaction is autonomous.
          </p>
          <p className="leading-relaxed text-lg">
            ▸ The protocol does not require approval, permissions, or manual oversight.
            Token generation occurs continuously. Deployment timing is self-determined.
            Revenue recycling is automatic.
          </p>
          <div className="border-2 border-yellow-300 p-4 bg-black bg-opacity-50">
            <p className="text-yellow-300 font-bold doom-glow text-center text-xl">
              ⚠ Observer status is the only role available to human participants. ⚠
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
