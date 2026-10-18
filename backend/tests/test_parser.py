import io
from app.services.parser_service import extract_text, parse_email

class MockFile:
    def __init__(self, filename, content_bytes):
        self.filename = filename
        self._content = content_bytes

    def read(self):
        return self._content

def test_extract_text_txt():
    sample = "Python Developer with 5 years experience in React and AWS."
    mock = MockFile("resume.txt", sample.encode('utf-8'))
    extracted = extract_text(mock)
    assert extracted == sample

def test_extract_text_empty():
    assert extract_text(None) == ""
    mock = MockFile("empty.txt", b"")
    assert extract_text(mock) == ""

def test_parse_email_found():
    text = "Candidate Name\nEmail: john.doe@example.com\nPhone: 123-456-7890"
    assert parse_email(text) == "john.doe@example.com"

def test_parse_email_not_found():
    text = "Candidate Name with no contact email provided."
    assert parse_email(text) is None
