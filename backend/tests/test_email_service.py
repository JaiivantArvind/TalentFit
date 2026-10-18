import pytest
from app.services.email_service import is_valid_resend_key, get_candidate_resend_keys

def test_is_valid_resend_key():
    assert is_valid_resend_key('re_1234567890abcdef') is True
    assert is_valid_resend_key('') is False
    assert is_valid_resend_key(None) is False
    assert is_valid_resend_key('your_resend_key') is False
    assert is_valid_resend_key('re_placeholder_key') is False
    assert is_valid_resend_key('invalid_prefix_key') is False

def test_get_candidate_resend_keys():
    keys = get_candidate_resend_keys(custom_key='re_custom_test_key_123')
    assert len(keys) >= 1
    assert 're_custom_test_key_123' in keys
