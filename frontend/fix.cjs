const fs = require('fs');
const path = 'd:/akash/Carbon_Footprint/frontend/src/index.css';
let content = fs.readFileSync(path, 'utf8');

// Find the start of the corrupted part, which is right after the last closing brace
// Let's just find the closing brace before the corrupted text
const goodPart = content.split('}/')[0] + '}\n';

const css = `
/* Household visual classes */
.household-visual-wrapper {
  position: relative;
  width: 100%;
  max-width: 300px;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.household-bg-circle {
  position: absolute;
  width: 200px;
  height: 140px;
  background: rgba(74, 222, 128, 0.1);
  border-radius: 100px;
  z-index: 1;
  transition: all 0.3s ease;
}

.household-visual-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 10px;
  width: 100%;
}

.household-users {
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.household-user-icon {
  margin-left: -10px;
}

.household-user-icon:first-child {
  margin-left: 0;
}

.household-home {
  color: var(--accent-emerald);
}

@media (max-width: 500px) {
  .household-visual-content {
    flex-wrap: wrap;
    flex-direction: column;
    align-items: center;
    gap: 0px;
  }
  
  .household-bg-circle {
    width: 250px;
    height: 190px;
    border-radius: 120px;
  }
  
  .household-users {
    flex-wrap: wrap;
    margin-bottom: -15px;
  }
}
`;

fs.writeFileSync(path, goodPart + css);
console.log('Fixed index.css');
