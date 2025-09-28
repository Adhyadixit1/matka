import { NavLink } from "react-router-dom";

const iconClasses = "w-6 h-6";

function HomeIcon({ active = false }: { active?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      className={iconClasses}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10.5 12 3l9 7.5M5.25 9V21h13.5V9"
      />
    </svg>
  );
}

function TicketIcon({ active = false }: { active?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      className={iconClasses}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8.5a2.5 2.5 0 0 0 0 5V19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5.5a2.5 2.5 0 0 0 0-5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"
      />
      <path d="M12 6v12" />
    </svg>
  );
}

function WalletIcon({ active = false }: { active?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      className={iconClasses}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7a3 3 0 0 1 3-3h9a2 2 0 0 1 0 4H6a3 3 0 0 1-3-1zM3 7v10a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-3a2 2 0 0 0-2-2h-3a2 2 0 1 1 0-4H8"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={iconClasses}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12c0 4.418-4.03 8-9 8-1.015 0-1.99-.147-2.9-.42L3 21l1.46-3.65C3.55 16.25 3 14.7 3 13c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

const BottomNav = () => {
  // Prevent touch events from interfering with scrolling
  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't prevent default on the actual links/buttons
    if ((e.target as HTMLElement).tagName === 'A' || 
        (e.target as HTMLElement).tagName === 'BUTTON') {
      return;
    }
    // Prevent default for other touch events to avoid scroll jank
    e.preventDefault();
  };

  return (
    <nav 
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-[hsl(var(--border))] safe-bottom shadow-[var(--shadow-card)]"
      style={{
        // Use transform for better performance
        transform: 'translateZ(0)',
        // Ensure it's above other content
        willChange: 'transform',
        // Prevent iOS rubber banding
        overscrollBehavior: 'none'
      }}
      onTouchStart={handleTouchStart}
    >
      <ul className="grid grid-cols-4 gap-1 px-2 py-1">
        <li>
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? "text-[hsl(var(--matka-orange))]"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <HomeIcon active={isActive} />
                <span className="mt-1">Home</span>
              </>
            )}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/profile?tab=bids"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? "text-[hsl(var(--matka-orange))]"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <TicketIcon active={isActive} />
                <span className="mt-1">My Bids</span>
              </>
            )}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/profile?tab=wallet"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? "text-[hsl(var(--matka-orange))]"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <WalletIcon active={isActive} />
                <span className="mt-1">Add Fund</span>
              </>
            )}
          </NavLink>
        </li>
        <li>
          <a
            href="https://wa.me/917426874591"
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center py-2 rounded-md text-xs font-medium transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChatIcon />
            <span className="mt-1">Live Chat</span>
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default BottomNav;
