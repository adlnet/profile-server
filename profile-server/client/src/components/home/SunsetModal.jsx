import React, { useState, useEffect } from "react";
import "./SunsetModal.css";

const SunsetModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Check localStorage when component mounts
  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenModal");
    if (!hasSeen) {
      setIsOpen(true);
    }

    // Handle ESC key to close
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenModal", "true");
  };

  return (
    <div>
        <style>
            {`
                body.modal-open {
                overflow: hidden;
                }

                .btn {
                padding: 6px 12px;
                border: 1px solid #ccc;
                background: #eee;
                border-radius: 4px;
                cursor: pointer;
                }
                .btn:hover {
                background: #ddd;
                }

                /* Backdrop */
                .modal-backdrop {
                position: fixed;
                top: 0; left: 0;
                width: 100vw; height: 100vh;
                background: rgba(0,0,0,0.5);
                opacity: 1;
                z-index: 1000;
                animation: fadeIn 0.3s ease;
                }

                /* Modal */
                .modal {
                position: fixed;
                top: 50%; left: 50%;
                transform: translate(-50%, -50%) scale(1);
                background: #fff;
                border-radius: 6px;
                box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                width: 400px;
                max-width: 90%;
                z-index: 1001;
                animation: popIn 0.3s ease;
                }

                .modal-header, .modal-footer {
                padding: 12px 16px;
                background: #f5f5f5;
                }
                .modal-header {
                border-bottom: 1px solid #ddd;
                }
                .modal-footer {
                border-top: 1px solid #ddd;
                text-align: right;
                }
                .modal-body {
                padding: 16px;
                }

                .close-btn {
                float: right;
                border: none;
                background: none;
                font-size: 20px;
                cursor: pointer;
                }

                @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
                }

                @keyframes popIn {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
            `}
        </style>
      {isOpen && (
        <>
          <div className="modal-backdrop" onClick={closeModal}></div>
          <div className="modal">
            <div className="modal-header">
                <h3 className="modal-title" id="announcementLabel" style={{color: "#004d97"}}>
					Notice: xAPI Tool Sunsetting
                </h3>
            </div>
            <div className="modal-body">
            <b>Notice</b>: As part of ADL's lifecycle management process, several legacy xAPI community tools -- including the 
                    sample ADL LRS, LRS Conformance Test Suite and Adopter Registry, and the xAPI Profile Server -- will be available 
                    on the ADL GitHub site, free to download and self-host within your organization's own network boundaries: 
                    <a target="_blank" href="https://github.com/orgs/adlnet/repositories?type=all">ADL GitHub</a>
                    
                    <hr/>

                    If you would like to use these tools after November 18th, please download from our GitHub repo, and if 
                    you need any assistance in installing the system, reach out to the ADL support team if you have any 
                    questions at <a href="mailto:help@adlnet.gov">help@adlnet.gov</a>.
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={closeModal}>
                Got it
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SunsetModal;