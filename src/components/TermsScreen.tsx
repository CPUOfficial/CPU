interface TermsScreenProps {
  onAccept: () => void;
}

export default function TermsScreen({ onAccept }: TermsScreenProps) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-8 z-50"
      style={{
        background: `
          repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.15) 0px,
            transparent 1px,
            transparent 2px,
            rgba(0, 0, 0, 0.15) 3px
          ),
          #a8a8a8
        `
      }}
    >
      <div className="doom-window p-3 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="doom-title-bar mb-3 doom-text-shadow">
          ▶ TERMS AND CONDITIONS
        </div>

        <div className="doom-panel-blue flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto space-y-3 mb-4 pr-2 flex-1">
            <div className="border-2 border-yellow-300 bg-yellow-900 bg-opacity-30 p-3">
              <div className="text-yellow-300 font-bold doom-glow text-center">
                ⚠ DISCLAIMER ⚠
              </div>
            </div>

            <div className="text-gray-200 space-y-2 text-sm">
              <p className="leading-relaxed">
                <span className="text-white font-bold">▸ 1. EXPERIMENTAL PROTOCOL</span>
                <br />
                This is an experimental token deployment system. All tokens are deployed on the blockchain
                for entertainment and experimental purposes only.
              </p>

              <p className="leading-relaxed">
                <span className="text-white font-bold">▸ 2. NO FINANCIAL ADVICE</span>
                <br />
                Nothing on this platform constitutes financial, investment, legal, or tax advice. Do not
                make any financial decisions based on information provided here.
              </p>

              <p className="leading-relaxed">
                <span className="text-white font-bold">▸ 3. RISK ACKNOWLEDGMENT</span>
                <br />
                Cryptocurrency trading involves substantial risk of loss. You may lose your entire
                investment. Only invest what you can afford to lose completely.
              </p>

              <p className="leading-relaxed">
                <span className="text-white font-bold">▸ 4. NO WARRANTIES</span>
                <br />
                This platform is provided "as is" without warranties of any kind. We do not guarantee
                the accuracy, completeness, or usefulness of any information.
              </p>

              <p className="leading-relaxed">
                <span className="text-white font-bold">▸ 5. USER RESPONSIBILITY</span>
                <br />
                You are solely responsible for your own research, decisions, and actions. Always conduct
                your own due diligence before engaging with any cryptocurrency.
              </p>

              <p className="leading-relaxed">
                <span className="text-white font-bold">▸ 6. NO LIABILITY</span>
                <br />
                The creators and operators of this platform are not liable for any losses, damages, or
                issues that may arise from your use of this service.
              </p>
            </div>

            <div className="border-2 border-white p-3 bg-black bg-opacity-50">
              <p className="text-gray-200 text-center">
                By clicking "ACCEPT", you acknowledge that you have read, understood, and agree to these
                terms and conditions.
              </p>
            </div>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={onAccept}
              className="doom-button text-xl py-3 w-full"
            >
              ▶ I ACCEPT ◀
            </button>
          </div>
        </div>

        <div className="doom-footer mt-3">
          <span className="doom-text-shadow">Read carefully before proceeding</span>
        </div>
      </div>
    </div>
  );
}
