import { useState } from "react";
import "./HowToUse.css";

export default function HowToUse() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="howto-btn" onClick={() => setOpen(true)}>How to Use</button>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>How to Use</h3>
            <p>
              First you need to signup or login, then you can add your own items to the barter list. You can see other peoples items and offer your items for them. If some one offers you, you can accept or reject it. Accepted items status will show exchanged and rejected items status will show rejected. click Logout button to logout . Enjoy 1!!
            </p>
            <button className="close-btn" onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
