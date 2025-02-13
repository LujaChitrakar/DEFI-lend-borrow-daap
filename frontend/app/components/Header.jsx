// import { Button } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Correct import
import { useEffect, useState } from "react";

const Header = () => {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLaunchApp = () => {
    if (isMounted) {
      router.push("/dashboard"); // Navigate to dashboard
    }
  };

  return (
    <header className="w-full py-4 px-8 bg-gradient-to-r from-[#0A0F1F] via-[#112240] to-[#0A0F1F]  top-0 left-0 right-0 flex justify-between items-center shadow-xl z-10 backdrop-blur-lg bg-opacity-90 border-b border-[#1E3A8A]/40">
      {/* Logo Section */}
      <div className="flex items-center logo-container">
        <div className="logo-inner-effects">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
        </div>
        <Image
          src="/logo.png"
          alt="LendWise Logo"
          width={140}
          height={45}
          className="object-contain relative z-10 transition-transform duration-300 ease-in-out hover:scale-110 logo-bright"
        />
      </div>

      {/* Button Section */}
      <div className="flex items-center gap-4">
      <button
  className="bg-gradient-to-r from-[#00C6FF] to-[#0072FF] px-7 py-3.5 rounded-full text-white font-semibold text-base hover:opacity-90 transition-all transform hover:scale-105 shadow-lg"
  onClick={handleLaunchApp}
>
  🚀 Launch App
</button>
      </div>

      <style jsx>{`
        /* Logo Container */
        .logo-container {
          position: relative;
          overflow: hidden;
        }

        /* Bright Logo Effect */
        .logo-bright {
          filter: brightness(1.8) contrast(1.3)
            drop-shadow(0 0 8px rgba(0, 198, 255, 0.6));
        }

        /* Particles Inside Logo */
        .logo-inner-effects {
          position: absolute;
          width: 130px;
          height: 40px;
          top: 0;
          left: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 0;
        }

        .particle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: radial-gradient(
            circle,
            rgba(0, 198, 255, 0.9),
            rgba(0, 198, 255, 0) 70%
          );
          border-radius: 50%;
          animation: particleMovement 3.5s infinite ease-in-out;
        }

        /* Specific Particle Positions */
        .particle-1 {
          top: 20%;
          left: 15%;
          animation-delay: 0s;
        }
        .particle-2 {
          top: 50%;
          left: 75%;
          animation-delay: 0.6s;
        }
        .particle-3 {
          top: 70%;
          left: 40%;
          animation-delay: 1.2s;
        }

        /* Particle Movement Animation */
        @keyframes particleMovement {
          0% {
            transform: scale(1) translate(0, 0);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.5) translate(8px, -8px);
            opacity: 1;
          }
          100% {
            transform: scale(1) translate(0, 0);
            opacity: 0.8;
          }
        }

        /* Header Adjustments */
        @media (max-width: 768px) {
          header {
            padding: 8px 16px;
          }

          .logo-container {
            justify-content: center;
          }

          .logo-bright {
            width: 100px;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
