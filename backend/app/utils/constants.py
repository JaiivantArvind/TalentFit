from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

SKILL_KEYWORDS = [
    'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Angular', 'Vue',
    'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'MySQL',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD',
    'Flask', 'Django', 'Spring Boot', 'Express',
    'Machine Learning', 'AI', 'Data Science', 'API', 'REST', 'GraphQL',
    'Git', 'Agile', 'Scrum', 'Linux', 'Bash'
]

# Master list used for set-based keyword matching
TARGET_SKILLS = [
    'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Angular', 'Vue',
    'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'SQLite',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD',
    'Flask', 'Django', 'Spring Boot', 'Express', 'FastAPI',
    'Machine Learning', 'Deep Learning', 'AI', 'Data Science', 'NLP', 'LLM',
    'API', 'REST', 'GraphQL', 'Git', 'Agile', 'Scrum', 'Linux', 'Bash',
    'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy',
    'Kafka', 'Spark', 'Hadoop', 'Terraform', 'Ansible', 'Selenium',
    'Kotlin', 'Swift', 'Go', 'Rust', 'PHP', 'Ruby', 'Rails', 'Scala',
    'Tableau', 'Power BI', 'OpenCV', 'Airflow', 'DevOps', 'Microservices'
]

# Alias map: normalized form -> canonical TARGET_SKILLS form
SKILL_ALIASES = {
    'nodejs':        'node.js',
    'node js':       'node.js',
    'node':          'node.js',
    'reactjs':       'react',
    'react js':      'react',
    'react.js':      'react',
    'vuejs':         'vue',
    'vue js':        'vue',
    'vue.js':        'vue',
    'angularjs':     'angular',
    'angular js':    'angular',
    'postgres':      'postgresql',
    'ml':            'machine learning',
    'dl':            'deep learning',
    'cicd':          'ci/cd',
    'ci cd':         'ci/cd',
    'springboot':    'spring boot',
    'expressjs':     'express',
    'express js':    'express',
    'express.js':    'express',
    'google cloud':  'gcp',
    'scikit':        'scikit-learn',
    'sklearn':       'scikit-learn',
    'powerbi':       'power bi',
    'power-bi':      'power bi',
    'golang':        'go',
}

# Generic resume/HR words that pollute keyword matching
CUSTOM_STOP_WORDS = frozenset(ENGLISH_STOP_WORDS) | frozenset([
    'professional', 'application', 'resume', 'summary', 'experience', 'work',
    'team', 'role', 'position', 'responsibilities', 'skills', 'ability',
    'knowledge', 'strong', 'excellent', 'good', 'looking', 'seeking',
    'candidate', 'years', 'company', 'organization', 'environment',
    'stack', 'passion', 'driven', 'motivated', 'dynamic', 'proven'
])

TECH_STACK = {s.lower() for s in TARGET_SKILLS}
TECH_WEIGHT = 3.0
GENERIC_WEIGHT = 1.0

SENIORITY_TERMS = {'senior', 'architect', 'lead', 'principal', 'staff', 'head of', 'manager'}
