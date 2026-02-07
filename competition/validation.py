"""
Submission validation for bioink GNN challenge.
"""

import os
import json
import pandas as pd
from typing import Tuple, List, Dict


def validate_submission(submission_dir: str, test_nodes_path: str) -> Tuple[bool, List[str], Dict]:
    """
    Validate a submission directory.
    
    Args:
        submission_dir: Path to submission folder (should contain predictions.csv and metadata.json)
        test_nodes_path: Path to test_nodes.csv with expected IDs
    
    Returns:
        (is_valid, error_messages, metadata)
    """
    errors = []
    metadata = {}
    
    # Check files exist
    pred_path = os.path.join(submission_dir, 'predictions.csv')
    meta_path = os.path.join(submission_dir, 'metadata.json')
    
    if not os.path.exists(pred_path):
        errors.append("predictions.csv not found")
        return False, errors, metadata
    
    if not os.path.exists(meta_path):
        errors.append("metadata.json not found")
        return False, errors, metadata
    
    # Load and validate metadata
    try:
        with open(meta_path, 'r') as f:
            metadata = json.load(f)
        
        required_fields = ['team', 'run_id', 'model_type']
        for field in required_fields:
            if field not in metadata:
                errors.append(f"metadata.json missing required field: {field}")
        
        # Validate model_type
        valid_types = ['human', 'llm-only', 'human+llm']
        if metadata.get('model_type') not in valid_types:
            errors.append(f"model_type must be one of: {valid_types}")
    
    except json.JSONDecodeError as e:
        errors.append(f"Invalid JSON in metadata.json: {e}")
        return False, errors, metadata
    except Exception as e:
        errors.append(f"Error reading metadata.json: {e}")
        return False, errors, metadata
    
    # Load and validate predictions
    try:
        preds = pd.read_csv(pred_path)
    except Exception as e:
        errors.append(f"Error reading predictions.csv: {e}")
        return False, errors, metadata
    
    # Check required columns
    required_cols = ['id', 'pressure', 'temperature', 'speed']
    for col in required_cols:
        if col not in preds.columns:
            errors.append(f"predictions.csv missing required column: {col}")
    
    if errors:
        return False, errors, metadata
    
    # Check for duplicates
    if preds['id'].duplicated().any():
        errors.append("Duplicate IDs found in predictions.csv")
    
    # Check for missing values
    for col in ['pressure', 'temperature', 'speed']:
        if preds[col].isna().any():
            errors.append(f"NaN values found in {col} column")
    
    # Check value ranges
    if (preds['pressure'] < 0).any():
        errors.append("Negative pressure values found")
    
    if (preds['temperature'] < 0).any():
        errors.append("Negative temperature values found")
    
    if (preds['speed'] < 0).any():
        errors.append("Negative speed values found")
    
    # Load test nodes and check ID match
    try:
        test_nodes = pd.read_csv(test_nodes_path)
        expected_ids = set(test_nodes['id'])
        submitted_ids = set(preds['id'])
        
        if expected_ids != submitted_ids:
            missing = expected_ids - submitted_ids
            extra = submitted_ids - expected_ids
            
            if missing:
                errors.append(f"Missing IDs: {sorted(list(missing))[:10]}...")
            if extra:
                errors.append(f"Extra IDs: {sorted(list(extra))[:10]}...")
    
    except Exception as e:
        errors.append(f"Error validating IDs: {e}")
    
    is_valid = len(errors) == 0
    return is_valid, errors, metadata


def format_validation_result(is_valid: bool, errors: List[str], metadata: Dict) -> str:
    """Format validation result as a readable message."""
    if is_valid:
        team = metadata.get('team', 'Unknown')
        run_id = metadata.get('run_id', 'Unknown')
        model_type = metadata.get('model_type', 'Unknown')
        
        msg = f"[OK] **VALID SUBMISSION**\n\n"
        msg += f"- **Team:** {team}\n"
        msg += f"- **Run ID:** {run_id}\n"
        msg += f"- **Model Type:** {model_type}\n"
        
        if 'model_description' in metadata:
            msg += f"- **Model:** {metadata['model_description']}\n"
        
        return msg
    else:
        msg = f"[FAIL] **INVALID SUBMISSION**\n\n"
        msg += "**Errors:**\n"
        for error in errors:
            msg += f"- {error}\n"
        return msg
