"""
services/roadmap_engine.py — Generate career roadmaps for students
"""
ROADMAPS = {
    "computer science": {
        "education": ["BS Computer Science (4 years)", "MS/MPhil CS (optional)"],
        "skills": ["Python, Java, C++", "Data Structures & Algorithms", "Web Dev (React, Node)", "AI/ML basics", "Cloud (AWS/Azure)"],
        "careers": ["Software Engineer", "Data Scientist", "AI Engineer", "Web Developer", "Cybersecurity Analyst"],
        "growth": ["Senior Engineer", "Tech Lead", "CTO", "Freelancer / Startup Founder"],
    },
    "pre-medical": {
        "education": ["MBBS (5 years)", "House Job (1 year)", "Specialization (FCPS/MRCP)"],
        "skills": ["Clinical skills", "Research", "Patient communication", "Medical technology"],
        "careers": ["General Physician", "Specialist Doctor", "Medical Researcher", "Surgeon"],
        "growth": ["Consultant", "Professor", "Hospital Director", "Research Lead"],
    },
    "engineering": {
        "education": ["BE/BS Engineering (4 years)", "MS Engineering (optional)"],
        "skills": ["AutoCAD / SolidWorks", "Project Management", "Problem solving", "Technical writing"],
        "careers": ["Civil Engineer", "Electrical Engineer", "Mechanical Engineer", "Project Manager"],
        "growth": ["Senior Engineer", "Project Director", "Own Consultancy"],
    },
    "business": {
        "education": ["BBA (4 years)", "MBA (2 years optional)"],
        "skills": ["Financial analysis", "Marketing", "Leadership", "Excel / ERP tools"],
        "careers": ["Business Analyst", "Marketing Manager", "Finance Officer", "Entrepreneur"],
        "growth": ["CEO", "Business Owner", "Investment Banker"],
    },
}

def get_roadmap(field: str) -> dict:
    field_lower = field.lower()
    for key, roadmap in ROADMAPS.items():
        if key in field_lower or field_lower in key:
            return {"field": field, "roadmap": roadmap}
    return {
        "field": field,
        "roadmap": {
            "education": [f"Find a relevant BS program in {field}"],
            "skills": ["Research your field's key tools and techniques"],
            "careers": ["Explore job listings in your field on Rozee.pk"],
            "growth": ["Network, build experience, consider MS/MBA"],
        }
    }
