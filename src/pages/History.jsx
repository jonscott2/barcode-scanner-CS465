import '../css/main.css';
import './History.css';

// Import custom web components
import '@georapbox/modal-element/dist/modal-element-defined.js';
import '../js/components/bs-history.js';

export default function History() {
  return (
    <div className="history-page">
      <div className="history-container">
        <div className="history-header">
          <h1>Scan History</h1>
          <p>View and manage your barcode scan history</p>
        </div>

        <div className="history-content">
          <bs-history />
        </div>
      </div>
    </div>
  );
}

