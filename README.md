# 🧬 Bioink GNN Challenge

A **secure, reproducible competition** for predicting 3D bioprinting parameters using Graph Neural Networks. Part of a research initiative comparing human-designed vs LLM-generated GNN architectures.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📋 Challenge Overview

### Task
Predict **three continuous targets** from bioink formulation graphs:

- **Pressure** (kPa): Extrusion force
- **Temperature** (°C): Printing temperature  
- **Speed** (mm/s): Print head velocity

### Dataset
### Dataset
- **423 formulations** from peer-reviewed publications
- **30 biomaterials** (appearing ≥5 times each)
- **303 training** / **120 test** samples (70/30 stratified group split)
- Real-world scientific data with natural complexity

### Evaluation Metric

NMAE = (1/3) × [MAE_pressure/1496 + MAE_temperature/228 + MAE_speed/90]

Lower is better. Range: 0.0 (perfect) to 1.0+ (poor).

### Baseline Performance
- **Random Forest:** NMAE = 0.060

---

## 🚀 Quick Start

### 1. Get the Data

```bash
git clone <this-repo>
cd bioink-gnn-challenge
```

Public data is in `data/public/`:
- `train.csv` - Training set with labels
- `test_features.csv` - Test features (no labels)
- `test_nodes.csv` - Test IDs
- `sample_submission.csv` - Example format

### 2. Train Your Model

Train on `train.csv`. Since there is no official validation set, you should create your own split (e.g., 80/20) from the training data to evaluate your model locally.

Use any approach:
- Graph Neural Networks (GCN, GAT, GraphSAGE, etc.)
- Traditional ML (Random Forest, XGBoost, etc.)
- Hybrid models
- LLM-generated architectures

### 3. Generate Predictions

Create `predictions.csv` for test set:

```csv
id,pressure,temperature,speed
340,150.5,25.0,5.0
341,800.0,155.0,1.2
...
399,45.0,23.0,8.5
```

### 4. Submit

Create a folder structure:

```
submissions/inbox/<team_name>/<run_id>/
├── predictions.csv
└── metadata.json
```

Example `metadata.json`:

```json
{
  "team": "YourTeamName",
  "run_id": "run_001",
  "model_type": "human",
  "model_description": "3-layer GAT with attention pooling",
  "features_used": ["material_graph", "concentrations", "needle_diameter"],
  "training_time_hours": 2.5,
  "framework": "PyTorch Geometric 2.3.0",
  "notes": "Used early stopping with patience=20"
}
```

**Model types:**
- `human` - Designed by humans
- `llm-only` - Generated entirely by LLM
- `human+llm` - Collaborative design

Open a **Pull Request** to `main`. Your submission will be automatically scored!

---

## 📊 Leaderboard

View the leaderboard:
- **Static:** [leaderboard/leaderboard.md](leaderboard/leaderboard.md)
- **Interactive:** Enable GitHub Pages → `/docs/leaderboard.html`

Rankings are by **NMAE (ascending)** - lower is better.

---

## 🔬 Data Details

### Bioink Components

30 common biomaterials across categories:
- **Alginates:** Alginate, Alginate Methacrylated, Alginate Dialdehyde
- **Gelatins:** Gelatin, Gelatin Methacrylated (GelMA)
- **Polymers:** PCL, PLGA, PEG derivatives
- **Natural:** Collagen, Chitosan, Hyaluronic Acid
- **Ceramics:** Hydroxyapatite, β-TCP, Bioactive Glass

### Target Distributions

| Target | Min | Max | Distribution |
|--------|-----|-----|--------------|
| Pressure | 4 kPa | 1500 kPa | Log-distributed, bimodal |
| Temperature | 2°C | 230°C | Bimodal (room temp vs melt) |
| Speed | 0.02 mm/s | 90 mm/s | Many near-zero values |

### Data Preprocessing

- **Ranges converted to means:** "70-80 kPa" → 75.0 kPa
- **Unit standardization:** All pressure in kPa, temp in °C, speed in mm/s
- **Stratified split:** By temperature regime (hydrogel vs thermoplastic)

---

## 🏗️ Repository Structure

```
bioink-gnn-challenge/
├── README.md                    # This file
├── requirements.txt             # Python dependencies
├── .gitignore                   # Excludes private data
│
├── data/
│   ├── public/                  # Visible to participants
│   │   ├── train.csv
│   │   ├── val.csv
│   │   ├── test_features.csv
│   │   ├── test_nodes.csv
│   │   └── sample_submission.csv
│   └── private/                 # NOT in git (GitHub Secrets)
│       └── test_labels.csv
│
├── competition/                 # Evaluation code
│   ├── data_utils.py           # Parsing & preprocessing
│   ├── metrics.py              # NMAE calculation
│   ├── validation.py           # Format checking
│   ├── evaluate.py             # Scoring script
│   └── render_leaderboard.py   # Generate markdown
│
├── baselines/                   # Reference implementations
│   ├── README.md
│   ├── random_forest.py
│   └── simple_gcn.py
│
├── submissions/
│   └── inbox/                   # PR submissions go here
│
├── leaderboard/
│   ├── leaderboard.csv         # Authoritative scores
│   └── leaderboard.md          # Auto-generated table
│
├── docs/                        # GitHub Pages
│   ├── leaderboard.html
│   ├── leaderboard.css
│   └── leaderboard.js
│
└── .github/workflows/
    ├── score_submission.yml     # Auto-score PRs
    └── update_leaderboard.yml   # Update on merge
```

---

## 📏 Submission Rules

### ✅ Allowed
- Any model architecture (GNN, ML, hybrid, etc.)
- Unlimited offline training
- Use of validation set for hyperparameter tuning
- Multiple submissions (track via `run_id`)
- LLM assistance (declare in `model_type`)

### ❌ Not Allowed
- Using test set labels for training
- Manual labeling of test data
- External datasets beyond provided data
- Modifying evaluation scripts
- Submitting code (predictions only)

### Verification
Top 3 teams must provide **reproducible code** post-challenge for verification.

---

## 🤖 Human vs LLM Research

This challenge supports research comparing human and LLM capabilities in GNN design.

### Metadata Tracking
- `model_type`: human / llm-only / human+llm
- `model_description`: Architecture details
- `framework`: PyTorch Geometric, DGL, etc.

### Research Questions
1. Do LLMs design competitive GNN architectures?
2. What patterns emerge in LLM vs human designs?
3. Does human+LLM collaboration outperform either alone?

### Fair Comparison
- Fixed time budget (e.g., 2 hours)
- Fixed submission budget (e.g., 5 runs)
- Same hardware access
- Honor system (post-challenge survey)

---

## 🛠️ Development Setup

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Prepare Data (Organizers Only)

```bash
python scripts/prepare_data.py
```

This creates train/test splits from `data.csv` (70% train, 30% test).

### Test Evaluation Locally

```bash
python competition/evaluate.py \
    submissions/inbox/example/run_001/predictions.csv \
    data/private/test_labels.csv \
    --format markdown
```

### Render Leaderboard

```bash
python competition/render_leaderboard.py
```

---

## 📖 Citation

If you use this challenge in academic work, please cite:

```bibtex
@misc{bioink-gnn-challenge,
  title={Bioink GNN Challenge: Predicting 3D Bioprinting Parameters},
  author={[Your Name]},
  year={2026},
  url={https://github.com/[your-org]/bioink-gnn-challenge}
}
```

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🙋 Support

- **Issues:** Use GitHub Issues for bugs/questions
- **Discussions:** Use GitHub Discussions for general chat
- **Email:** [your-email] for private inquiries

---

## 🎯 Tips for Success

1. **Start simple:** Beat the Random Forest baseline first
2. **Feature engineering:** Material properties, graph topology, concentration patterns
3. **Multi-task learning:** Share representations across targets
4. **Validation strategy:** Use local validation split to prevent overfitting
5. **Ensemble methods:** Combine multiple models
6. **Domain knowledge:** Understand bioprinting physics

Good luck! 🚀
