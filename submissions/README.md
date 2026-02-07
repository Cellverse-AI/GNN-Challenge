# Submissions

Place your submissions in `inbox/<team_name>/<run_id>/`

## Structure

```
inbox/
└── YourTeamName/
    ├── run_001/
    │   ├── predictions.csv
    │   └── metadata.json
    ├── run_002/
    │   ├── predictions.csv
    │   └── metadata.json
    └── ...
```

## Files Required

### predictions.csv
```csv
id,pressure,temperature,speed
340,150.5,25.0,5.0
341,800.0,155.0,1.2
...
```

### metadata.json
```json
{
  "team": "YourTeamName",
  "run_id": "run_001",
  "model_type": "human",
  "model_description": "3-layer GAT with attention pooling",
  "features_used": ["material_graph", "concentrations"],
  "training_time_hours": 2.5,
  "framework": "PyTorch Geometric 2.3.0",
  "notes": "Optional notes about this run"
}
```

## Submission Process

1. Fork this repository
2. Create your submission folder
3. Add predictions.csv and metadata.json
4. Open a Pull Request to `main`
5. Wait for automatic scoring
6. If valid, PR will be merged and leaderboard updated

See [README.md](../README.md) for full details.
