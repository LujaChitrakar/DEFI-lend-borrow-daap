"use client";

import { useContext, useEffect, useState } from "react";
import { DefiContext } from "./context/DefiContext";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Home() {
  const { currentAccount } = useContext(DefiContext);
  const [stars, setStars] = useState([]);
  const [circles, setCircles] = useState([]);

  useEffect(() => {
    const generateStars = () => {
      const starsArray = Array.from({ length: 200 }, () => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 1,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${Math.random() * 2 + 2}s`,
      }));
      setStars(starsArray);
    };

    const generateCircles = () => {
      const row1 = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        row: 1,
        left: `${i * 18 + 10}%`,
        color1: `hsl(${Math.random() * 60 + 200}, 80%, 65%)`,
        color2: `hsl(${Math.random() * 60 + 180}, 85%, 45%)`,
      }));

      const row2 = Array.from({ length: 5 }, (_, i) => ({
        id: i + 5,
        row: 2,
        left: `${i * 18 + 10}%`,
        color1: `hsl(${Math.random() * 60 + 300}, 80%, 65%)`,
        color2: `hsl(${Math.random() * 60 + 280}, 85%, 45%)`,
      }));

      setCircles([...row1, ...row2]);
    };

    generateStars();
    generateCircles();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      {/* Starry Background */}
      <div className="starry-background fixed inset-0">
        {stars.map((star, i) => (
          <div
            key={i}
            className="star"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: star.animationDelay,
              animationDuration: star.animationDuration,
            }}
          />
        ))}
      </div>

      <Header />

      <main className="flex-1 relative">
        {/* Hero Section */}
        <section className=" min-h-screen flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 to-black/60 z-0"></div>

          <div className="ring-animation-wrapper relative z-10">
            <div className="orbit"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`ring ring-${i} border-opacity-50 hover:border-opacity-100 transition-all duration-500`}
              />
            ))}

            <div className="absolute inset-0 ring-glow pointer-events-none"></div>
          </div>

          <div className="absolute z-20 text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600 animate-gradient-x">
              Smart finance for the future of DeFi.
            </h1>
            <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
              Empowering decentralized financial experiences through
              cutting-edge blockchain technology.
            </p>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-gradient-to-b from-gray-800 to-gray-900 py-20 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20 opacity-50 pointer-events-none"></div>

          <div className="relative z-10 text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              How LendWise Works
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Revolutionizing DeFi with transparent, efficient, and user-centric
              lending solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto relative">
            {/* Lenders Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative bg-gray-900 p-8 rounded-xl overflow-hidden shadow-2xl border border-gray-800">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold mb-6 text-blue-400 flex items-center justify-center">
                    <span className="mr-4 text-4xl">💰</span>
                    For Lenders
                  </h3>
                  <ul className="text-gray-300 space-y-4 text-left">
                    <li className="flex items-center">
                      <span className="mr-3 text-blue-500 text-xl">▸</span>
                      <strong>Deposit:</strong> Lend stablecoins like USDT or
                      USDC
                    </li>
                    <li className="flex items-center">
                      <span className="mr-3 text-blue-500 text-xl">▸</span>
                      <strong>Earn:</strong> Fixed interest over predictable
                      time frames
                    </li>
                    <li className="flex items-center">
                      <span className="mr-3 text-blue-500 text-xl">▸</span>
                      <strong>Withdraw:</strong> Instant access to your funds
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Borrowers Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative bg-gray-900 p-8 rounded-xl overflow-hidden shadow-2xl border border-gray-800">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-600/20 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold mb-6 text-green-400 flex items-center justify-center">
                    <span className="mr-4 text-4xl">🏦</span>
                    For Borrowers
                  </h3>
                  <ul className="text-gray-300 space-y-4 text-left">
                    <li className="flex items-center">
                      <span className="mr-3 text-green-500 text-xl">▸</span>
                      <strong>Collateralize:</strong> Use WETH or WBTC as secure
                      collateral
                    </li>
                    <li className="flex items-center">
                      <span className="mr-3 text-green-500 text-xl">▸</span>
                      <strong>Borrow:</strong> Get USDT or USDC instantly
                    </li>
                    <li className="flex items-center">
                      <span className="mr-3 text-green-500 text-xl">▸</span>
                      <strong>Repay:</strong> Flexible terms with competitive
                      interest
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Floating Circles Section */}
        <section className="bg-gradient-to-b from-gray-900 to-black py-40 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-blue-900/10 opacity-50 pointer-events-none"></div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                Meet LendWise
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Your gateway to seamless, secure, and smart decentralized
                finance.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-0 group-hover:opacity-75 transition duration-500"></div>
                <div className="relative bg-gray-900 p-8 rounded-xl border border-gray-800 text-center transform transition-all duration-300 hover:-translate-y-4">
                  <div className="text-6xl mb-6 text-blue-400">🔒</div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Secure</h3>
                  <p className="text-gray-300">
                    Advanced security protocols protect your assets
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl blur-lg opacity-0 group-hover:opacity-75 transition duration-500"></div>
                <div className="relative bg-gray-900 p-8 rounded-xl border border-gray-800 text-center transform transition-all duration-300 hover:-translate-y-4">
                  <div className="text-6xl mb-6 text-green-400">⚡</div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Fast</h3>
                  <p className="text-gray-300">
                    Instant transactions with minimal latency
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-red-600 rounded-xl blur-lg opacity-0 group-hover:opacity-75 transition duration-500"></div>
                <div className="relative bg-gray-900 p-8 rounded-xl border border-gray-800 text-center transform transition-all duration-300 hover:-translate-y-4">
                  <div className="text-6xl mb-6 text-pink-400">📊</div>
                  <h3 className="text-2xl font-bold mb-4 text-white">
                    Transparent
                  </h3>
                  <p className="text-gray-300">
                    Full visibility into your financial operations
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Keep the existing floating circles animation */}
          <div className="floating-circles justify items-center">
            {circles.map((circle) => (
              <div
                key={circle.id}
                className="circle"
                style={{
                  left: circle.left,
                  // Change these values to move circles down
                  top: circle.row === 1 ? "35%" : "75%",
                  width: "120px",
                  height: "120px",
                  background: `linear-gradient(135deg, ${circle.color1} 50%, ${circle.color2} 50%)`,
                  animationDuration: `${Math.random() * 4 + 3}s`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        /* Hero Section Rings */
        .ring-animation-wrapper {
          position: relative;
          width: 700px;
          height: 700px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ring-glow {
          pointer-events: none;
          background: radial-gradient(
            600px circle at center,
            rgba(138, 43, 226, 0.15),
            transparent 50%
          );
        }

        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-move 3s ease infinite;
        }

        .ring {
          border: 6px solid rgba(138, 43, 226, 0.5);
          border-radius: 50%;
          position: absolute;
          animation: pulse 4s infinite ease-in-out;
        }

        .ring-1 {
          width: 300px;
          height: 300px;
          animation-delay: 0s;
        }

        .ring-2 {
          width: 450px;
          height: 450px;
          animation-delay: 0.5s;
        }

        .ring-3 {
          width: 600px;
          height: 600px;
          animation-delay: 1s;
        }

        .ring-4 {
          width: 750px;
          height: 750px;
          animation-delay: 1.5s;
        }

        .orbit {
          width: 850px;
          height: 850px;
          border: 2px dashed rgba(138, 43, 226, 0.3);
          border-radius: 50%;
          position: absolute;
          animation: orbit-spin 12s linear infinite;
        }

        /* Circles Animation */
        .floating-circles {
          position: relative;
          width: 100%;
          height: 400px;
          overflow: hidden;
        }

        .circle {
          position: absolute;
          border-radius: 50%;
          opacity: 0.7;
          filter: blur(10px);
          transition: all 0.5s ease;
          transform-origin: center;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
        }
        @keyframes sine-wave-enhanced {
          0%,
          100% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(0.9);
          }
          25% {
            transform: translateY(-30px) translateX(-20px) rotate(45deg)
              scale(1.1);
          }
          50% {
            transform: translateY(-60px) translateX(0) rotate(90deg) scale(1.2);
          }
          75% {
            transform: translateY(-30px) translateX(20px) rotate(135deg)
              scale(1.1);
          }
        }

        @keyframes color-shift {
          0% {
            filter: hue-rotate(0deg);
          }
          50% {
            filter: hue-rotate(180deg);
          }
          100% {
            filter: hue-rotate(360deg);
          }
        }

        .circle {
          animation: sine-wave-enhanced 6s infinite ease-in-out,
            color-shift 12s infinite linear;
        }

        .circle:hover {
          transform: scale(1.2);
          filter: blur(5px) brightness(1.2);
          z-index: 10;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.5;
          }
          100% {
            transform: scale(0.8);
            opacity: 0;
          }
        }
        @keyframes gradient-move {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes orbit-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes sine-wave {
          0% {
            transform: translateY(0);
          }
          25% {
            transform: translateY(-15px) translateX(-10px);
          }
          50% {
            transform: translateY(-30px) translateX(0);
          }
          75% {
            transform: translateY(-15px) translateX(10px);
          }
          100% {
            transform: translateY(0);
          }
        }

        /* Starry Background */
        .starry-background {
          z-index: 0;
          pointer-events: none;
        }

        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          opacity: 0;
          animation: twinkle infinite ease-in-out;
        }

        @keyframes twinkle {
          0%,
          100% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            opacity: 0.8;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
