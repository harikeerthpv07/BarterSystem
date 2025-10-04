import { useState } from "react";
import "./AboutMe.css";

export default function AboutMe() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="about-btn" onClick={() => setOpen(true)}>About Me</button>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Harikeerth P V</h3>
            <ul>
              <li><strong>LinkedIn:</strong> <a href="https://linkedin.com/in/harikeerth-p-v-79667b250/" target="_blank">linkedin.com/in/harikeerth-p-v-79667b250</a></li>
              <li><strong>GitHub:</strong> <a href="https://github.com/harikeerthpv07" target="_blank">github.com/harikeerthpv07</a></li>
              <li><strong>LeetCode:</strong> <a href="https://leetcode.com/u/HARIKEERTHPV/" target="_blank">leetcode.com/u/HARIKEERTHPV</a></li>
              <li><strong>Portfolio:</strong> <a href="https://www.harikeerth.xyz" target="_blank">www.harikeerth.xyz</a></li>
            </ul>
            <button className="close-btn" onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
