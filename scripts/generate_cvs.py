from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
PAGE_WIDTH, PAGE_HEIGHT = A4

INK = HexColor("#10231F")
MUTED = HexColor("#51615D")
ACCENT = HexColor("#078773")
PAPER = HexColor("#FFFFFF")
SOFT = HexColor("#EAF5F2")


CONTENT = {
    "da": {
        "filename": "CV_Martin_Gerlach_DA.pdf",
        "subtitle": "Multimediedesignstuderende | Frontend & kreativ teknologi",
        "profile_title": "PROFIL",
        "profile": (
            "Jeg studerer multimediedesign og er uddannet IT-supporter. "
            "Jeg kombinerer brugerforståelse, visuel struktur og frontendkode, "
            "mens jeg udvikler mig mod studiejob inden for frontend, software og AI UX."
        ),
        "contact_title": "KONTAKT & LINKS",
        "skills_title": "KOMPETENCER",
        "skills": [
            ("Frontend", "HTML, CSS, JavaScript, responsive design, DOM, Fetch API, JSON"),
            ("Backend", "Node.js og Express - erfaring fra projekter"),
            ("AI / UX", "OpenAI API, promptdesign og AI UX - lærer gennem projekter"),
            ("Design", "Figma, Photoshop, Premiere Pro"),
            ("Tools", "Git, GitHub, VS Code, npm, Cloudflare, GitHub Pages"),
        ],
        "languages_title": "SPROG",
        "languages": "Dansk - modersmål<br/>English - professional working proficiency",
        "education_title": "UDDANNELSE",
        "education": [
            ("Multimedia Design", "Københavns Erhvervsakademi (EK)", "2025 - nu"),
            (
                "IT Support Specialist",
                "Data- og kommunikationsuddannelsen, TEC Ballerup. Afsluttende gennemsnit: 8,6.",
                "2021 - 2024",
            ),
        ],
        "projects_title": "UDVALGTE PROJEKTER",
        "projects": [
            (
                "StudyMate AI",
                "Byggede en funktionel studieassistent-prototype med valgbare roller, en Node/Express API-route og OpenAI-baserede svar.",
            ),
            (
                "LG Bio Capital Partners",
                "Designede og byggede et responsivt kundewebsite, der omsætter specialiseret life-science-indhold til en tydelig informationsarkitektur.",
            ),
            (
                "Blade Rhythm",
                "Skabte et spilbart JavaScript-timingspil med tastaturstyring, game state, feedback og stigende sværhedsgrad.",
            ),
            (
                "AquaShield",
                "Udviklede et responsivt skoleprojekt med interaktionsdesign, UX-writing og et formularflow i flere trin.",
            ),
        ],
        "experience_title": "ERFARING",
        "experience": [
            (
                "IT-supporter - MT Højgaard",
                "September 2024 - marts 2025",
                "Support, onboarding, enhedsopsætning, Active Directory, MFA og møderumsteknologi i en stor organisation. Rollen styrkede systematisk fejlfinding og tydelig brugerkommunikation.",
            ),
            ("IT Support Trainee - MT Højgaard", "Oktober 2022 - september 2024", ""),
        ],
        "portfolio_title": "PORTFOLIO",
        "portfolio_text": "Cases, live projekter og kode: gerlachdesign.dk",
    },
    "en": {
        "filename": "CV_Martin_Gerlach_EN.pdf",
        "subtitle": "Multimedia Design Student | Frontend & Creative Technology",
        "profile_title": "PROFILE",
        "profile": (
            "I study Multimedia Design and am a qualified IT support specialist. "
            "I combine user understanding, visual structure and frontend code while "
            "developing toward student roles in frontend, software and AI UX."
        ),
        "contact_title": "CONTACT & LINKS",
        "skills_title": "SKILLS",
        "skills": [
            ("Frontend", "HTML, CSS, JavaScript, responsive design, DOM, Fetch API, JSON"),
            ("Backend", "Node.js and Express - project experience"),
            ("AI / UX", "OpenAI API, prompt design and AI UX - learning by building"),
            ("Design", "Figma, Photoshop, Premiere Pro"),
            ("Tools", "Git, GitHub, VS Code, npm, Cloudflare, GitHub Pages"),
        ],
        "languages_title": "LANGUAGES",
        "languages": "Danish - native<br/>English - professional working proficiency",
        "education_title": "EDUCATION",
        "education": [
            ("Multimedia Design", "Copenhagen School of Design and Technology (EK)", "2025 - present"),
            (
                "IT Support Specialist",
                "Data and Communications programme, TEC Ballerup. Final grade average: 8.6.",
                "2021 - 2024",
            ),
        ],
        "projects_title": "SELECTED PROJECTS",
        "projects": [
            (
                "StudyMate AI",
                "Built a functional study-assistant prototype with selectable roles, a Node/Express API route and OpenAI-powered responses.",
            ),
            (
                "LG Bio Capital Partners",
                "Designed and built a responsive client website that turns specialist life-science advisory content into a clear information hierarchy.",
            ),
            (
                "Blade Rhythm",
                "Created a playable JavaScript timing game with keyboard controls, game state, feedback and increasing difficulty.",
            ),
            (
                "AquaShield",
                "Developed a responsive school project with interaction design, UX writing and a multi-step form flow.",
            ),
        ],
        "experience_title": "EXPERIENCE",
        "experience": [
            (
                "IT Support Specialist - MT Højgaard",
                "September 2024 - March 2025",
                "Support, onboarding, device setup, Active Directory, MFA and meeting-room technology for a large organisation. The role strengthened systematic troubleshooting and clear user communication.",
            ),
            ("IT Support Trainee - MT Hojgaard", "October 2022 - September 2024", ""),
        ],
        "portfolio_title": "PORTFOLIO",
        "portfolio_text": "Case studies, live projects and code: gerlachdesign.dk",
    },
}


def style(name, size, color=INK, leading=None, bold=False, alignment=TA_LEFT):
    return ParagraphStyle(
        name,
        fontName="Helvetica-Bold" if bold else "Helvetica",
        fontSize=size,
        leading=leading or size * 1.35,
        textColor=color,
        alignment=alignment,
        spaceAfter=0,
        spaceBefore=0,
    )


BODY = style("body", 7.8, MUTED, 10.6)
BODY_SMALL = style("body-small", 7.4, MUTED, 9.8)
TITLE = style("title", 9.2, INK, 11.2, bold=True)
DATE = style("date", 7.6, ACCENT, 9.6, alignment=TA_RIGHT)
SECTION = style("section", 8.2, ACCENT, 10, bold=True)


def draw_paragraph(pdf, text, paragraph_style, x, top, width):
    paragraph = Paragraph(text, paragraph_style)
    _, height = paragraph.wrap(width, PAGE_HEIGHT)
    paragraph.drawOn(pdf, x, top - height)
    return top - height


def draw_section_heading(pdf, text, x, top):
    top = draw_paragraph(pdf, text, SECTION, x, top, 220 * mm)
    pdf.setStrokeColor(ACCENT)
    pdf.setLineWidth(1)
    pdf.line(x, top - 1.5 * mm, x + 24 * mm, top - 1.5 * mm)
    return top - 5 * mm


def draw_dated_item(pdf, title, detail, date, x, top, width):
    date_width = 36 * mm
    title_width = width - date_width - 3 * mm
    title_bottom = draw_paragraph(pdf, title, TITLE, x, top, title_width)
    draw_paragraph(pdf, date, DATE, x + width - date_width, top, date_width)
    detail_bottom = draw_paragraph(pdf, detail, BODY_SMALL, x, title_bottom - 1.2 * mm, width)
    return detail_bottom - 3.2 * mm


def build_cv(language):
    data = CONTENT[language]
    output = ROOT / data["filename"]
    pdf = canvas.Canvas(str(output), pagesize=A4)
    pdf.setTitle("Martin Gerlach - CV")
    pdf.setAuthor("Martin Gerlach")

    header_height = 34 * mm
    pdf.setFillColor(INK)
    pdf.rect(0, PAGE_HEIGHT - header_height, PAGE_WIDTH, header_height, stroke=0, fill=1)
    pdf.setFillColor(PAPER)
    pdf.setFont("Helvetica-Bold", 25)
    pdf.drawString(18 * mm, PAGE_HEIGHT - 14 * mm, "Martin Gerlach")
    pdf.setFont("Helvetica", 10.5)
    pdf.drawString(18 * mm, PAGE_HEIGHT - 23 * mm, data["subtitle"])
    pdf.setFillColor(HexColor("#C5D1CE"))
    pdf.setFont("Helvetica", 7.7)
    pdf.drawString(
        18 * mm,
        PAGE_HEIGHT - 29 * mm,
        "Copenhagen, Denmark  |  +45 3048 4601  |  martin.gerlach.2950@gmail.com",
    )

    left_x = 18 * mm
    left_width = 61 * mm
    right_x = 93 * mm
    right_width = PAGE_WIDTH - right_x - 18 * mm
    top = PAGE_HEIGHT - header_height - 11 * mm

    left_top = draw_section_heading(pdf, data["profile_title"], left_x, top)
    left_top = draw_paragraph(pdf, data["profile"], BODY, left_x, left_top, left_width) - 6 * mm

    left_top = draw_section_heading(pdf, data["contact_title"], left_x, left_top)
    contact = (
        '<link href="https://gerlachdesign.dk/" color="#10231F">gerlachdesign.dk</link><br/>'
        '<link href="https://github.com/martincgerlach" color="#10231F">github.com/martincgerlach</link><br/>'
        '<link href="https://www.linkedin.com/in/martin-christoffer-gerlach-68272a21a/" color="#10231F">LinkedIn</link>'
    )
    left_top = draw_paragraph(pdf, contact, BODY, left_x, left_top, left_width) - 6 * mm

    left_top = draw_section_heading(pdf, data["skills_title"], left_x, left_top)
    for skill_title, skill_text in data["skills"]:
        left_top = draw_paragraph(pdf, skill_title, TITLE, left_x, left_top, left_width)
        left_top = draw_paragraph(pdf, skill_text, BODY_SMALL, left_x, left_top - 0.8 * mm, left_width) - 2.4 * mm

    left_top = draw_section_heading(pdf, data["languages_title"], left_x, left_top - 1.5 * mm)
    draw_paragraph(pdf, data["languages"], BODY_SMALL, left_x, left_top, left_width)

    right_top = draw_section_heading(pdf, data["education_title"], right_x, top)
    for education_title, education_detail, education_date in data["education"]:
        right_top = draw_dated_item(
            pdf, education_title, education_detail, education_date, right_x, right_top, right_width
        )

    right_top = draw_section_heading(pdf, data["projects_title"], right_x, right_top - 1 * mm)
    for project_title, project_text in data["projects"]:
        pdf.setFillColor(ACCENT)
        pdf.circle(right_x + 1.3 * mm, right_top - 2.5 * mm, 0.75 * mm, stroke=0, fill=1)
        right_top = draw_paragraph(pdf, project_title, TITLE, right_x + 5 * mm, right_top, right_width - 5 * mm)
        right_top = draw_paragraph(
            pdf, project_text, BODY_SMALL, right_x + 5 * mm, right_top - 0.6 * mm, right_width - 5 * mm
        ) - 2.2 * mm

    right_top = draw_section_heading(pdf, data["experience_title"], right_x, right_top - 0.8 * mm)
    for job_title, job_date, job_text in data["experience"]:
        right_top = draw_dated_item(pdf, job_title, job_text, job_date, right_x, right_top, right_width)

    box_y = 18 * mm
    box_height = 14 * mm
    pdf.setFillColor(SOFT)
    pdf.roundRect(right_x, box_y, right_width, box_height, 2 * mm, stroke=0, fill=1)
    draw_paragraph(pdf, data["portfolio_title"], SECTION, right_x + 5 * mm, box_y + 10.5 * mm, right_width - 10 * mm)
    draw_paragraph(pdf, data["portfolio_text"], BODY_SMALL, right_x + 5 * mm, box_y + 6 * mm, right_width - 10 * mm)
    pdf.linkURL("https://gerlachdesign.dk/", (right_x, box_y, right_x + right_width, box_y + box_height))

    pdf.showPage()
    pdf.save()


if __name__ == "__main__":
    for language_code in ("da", "en"):
        build_cv(language_code)
