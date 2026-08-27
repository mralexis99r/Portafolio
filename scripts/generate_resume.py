from __future__ import annotations

from pathlib import Path
from shutil import copy2

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
PUBLIC_DIR = ROOT / "public" / "resume"
PHOTO = ROOT / "public" / "profile.webp"

NAVY = colors.HexColor("#0A2530")
TEAL = colors.HexColor("#087F83")
INK = colors.HexColor("#152A33")
MUTED = colors.HexColor("#5D6C72")
LINE = colors.HexColor("#D7DEDF")
SOFT = colors.HexColor("#EEF4F3")
WHITE = colors.white

PAGE_W, PAGE_H = A4
LEFT = 18 * mm
RIGHT = 18 * mm
TOP = 18 * mm
BOTTOM = 15 * mm


DATA = {
    "en": {
        "label": "ENGLISH",
        "title": "QA ENGINEER",
        "focus": "FUNCTIONAL  /  AUTOMATION  /  PERFORMANCE",
        "contact": "Monterrey, Nuevo León, México  |  +52 81 2616 5476  |  alexissantiagobsuiness@gmail.com",
        "links": "<link href='https://www.linkedin.com/in/alexis-roman-santiago/' color='#5D6C72'>linkedin.com/in/alexis-roman-santiago</link>  |  <link href='https://github.com/mralexis99r' color='#5D6C72'>github.com/mralexis99r</link>",
        "summary_title": "PROFILE",
        "summary": "QA Engineer with more than 4 years of experience across manual, functional, automation, integration, API, data, and performance testing. I turn requirements and user stories into clear coverage, maintain automation assets, and work with delivery teams to make quality risks visible before release.",
        "strengths_title": "CORE QA CAPABILITIES",
        "strengths": [
            "Test analysis and design",
            "Selenium + Java + TestNG",
            "Playwright + TypeScript",
            "API testing + Postman",
            "SQL and data validation",
            "Gatling + JMeter",
            "Regression and integration",
            "CI/CD and Agile delivery",
        ],
        "experience_title": "PROFESSIONAL EXPERIENCE",
        "environment": "Environment",
        "experience": [
            {
                "company": "AXITY",
                "role": "QA Automation Engineer",
                "period": "Dec 2025 - Present",
                "current": "CURRENT",
                "bullets": [
                    "Analyze requirements and user stories to design manual, integration, and end-to-end test coverage.",
                    "Maintain existing automation and create Selenium and TestNG scripts for new test cases.",
                    "Execute performance and user load testing with Gatling, Java, and JMeter in a Scrum team.",
                ],
                "tech": "Selenium  |  Java  |  TestNG  |  Gatling  |  JMeter  |  Scrum",
            },
            {
                "company": "SWBC",
                "role": "QA Engineer",
                "period": "Sep 2025 - Dec 2025",
                "bullets": [
                    "Performed primarily manual testing according to project needs.",
                    "Maintained existing automated test cases using Selenium and Java.",
                ],
                "tech": "Manual Testing  |  Selenium  |  Java",
            },
            {
                "company": "NEORIS",
                "role": "QA Engineer",
                "period": "Feb 2024 - Apr 2025",
                "bullets": [
                    "Performed functional testing and supported automation pipelines.",
                    "Prepared test data and executed automated test suites.",
                    "Collaborated with Agile teams to maintain stable releases.",
                ],
                "tech": "Jenkins  |  Bitbucket  |  Git  |  Agile",
            },
            {
                "company": "NTT DATA",
                "role": "QA Engineer",
                "period": "Nov 2023 - Feb 2024",
                "bullets": [
                    "Designed and executed manual test cases, smoke tests, and database validations.",
                    "Logged and tracked defects throughout sprints and regression cycles.",
                ],
                "tech": "Jira  |  SQL  |  Scrum  |  Regression Testing",
            },
            {
                "company": "BANORTE",
                "role": "QA Lead",
                "period": "May 2023 - Oct 2023",
                "bullets": [
                    "Coordinated functional and regression testing for banking applications.",
                    "Estimated testing efforts and collaborated with developers and external vendors.",
                    "Managed defects and documented the testing lifecycle.",
                ],
                "tech": "Functional Testing  |  Regression Testing  |  Defect Management",
            },
            {
                "company": "OXXO",
                "role": "QA Engineer",
                "period": "Apr 2022 - Feb 2023",
                "bullets": [
                    "Performed functional and regression testing on point-of-sale systems.",
                    "Tracked defects and collaborated with development teams in Agile processes.",
                ],
                "tech": "Functional Testing  |  Regression Testing  |  Agile",
            },
        ],
        "projects_title": "SELECTED QA PROJECTS",
        "projects": [
            ("Booking UI Automation", "Playwright, TypeScript, JSON data, search and filtering coverage.", "github.com/mralexis99r/Booking-automation"),
            ("Selenium Java Automation", "Java 17, Selenium, TestNG, Page Objects, and JSON test data.", "github.com/mralexis99r/selenium-java-automation"),
        ],
        "education_title": "EDUCATION",
        "education": "Administrative Computer Engineering  |  Universidad TecMilenio  |  2017 - 2022",
        "languages_title": "LANGUAGES",
        "languages": "Spanish C1-C2  |  English B2-C1",
    },
    "es": {
        "label": "ESPAÑOL",
        "title": "QA ENGINEER",
        "focus": "FUNCIONAL  /  AUTOMATIZACIÓN  /  RENDIMIENTO",
        "contact": "Monterrey, Nuevo León, México  |  +52 81 2616 5476  |  alexissantiagobsuiness@gmail.com",
        "links": "<link href='https://www.linkedin.com/in/alexis-roman-santiago/' color='#5D6C72'>linkedin.com/in/alexis-roman-santiago</link>  |  <link href='https://github.com/mralexis99r' color='#5D6C72'>github.com/mralexis99r</link>",
        "summary_title": "PERFIL",
        "summary": "QA Engineer con más de 4 años de experiencia en pruebas manuales, funcionales, de automatización, integración, APIs, datos y rendimiento. Convierto requerimientos e historias de usuario en cobertura clara, mantengo activos de automatización y colaboro con los equipos para hacer visibles los riesgos antes de cada entrega.",
        "strengths_title": "CAPACIDADES PRINCIPALES DE QA",
        "strengths": [
            "Análisis y diseño de pruebas",
            "Selenium + Java + TestNG",
            "Playwright + TypeScript",
            "API testing + Postman",
            "SQL y validación de datos",
            "Gatling + JMeter",
            "Regresión e integración",
            "CI/CD y entrega Agile",
        ],
        "experience_title": "EXPERIENCIA PROFESIONAL",
        "environment": "Entorno",
        "experience": [
            {
                "company": "AXITY",
                "role": "QA Automation Engineer",
                "period": "dic. 2025 - actualidad",
                "current": "ACTUAL",
                "bullets": [
                    "Análisis de requerimientos e historias de usuario para diseñar cobertura manual, de integración e integral.",
                    "Mantenimiento de automatizaciones existentes y creación de scripts Selenium y TestNG para casos nuevos.",
                    "Pruebas de rendimiento y carga de usuarios con Gatling, Java y JMeter dentro de un equipo Scrum.",
                ],
                "tech": "Selenium  |  Java  |  TestNG  |  Gatling  |  JMeter  |  Scrum",
            },
            {
                "company": "SWBC",
                "role": "QA Engineer",
                "period": "sept. 2025 - dic. 2025",
                "bullets": [
                    "Ejecución de pruebas principalmente manuales de acuerdo con las necesidades de los proyectos.",
                    "Mantenimiento de casos de prueba automatizados existentes con Selenium y Java.",
                ],
                "tech": "Pruebas manuales  |  Selenium  |  Java",
            },
            {
                "company": "NEORIS",
                "role": "QA Engineer",
                "period": "feb. 2024 - abr. 2025",
                "bullets": [
                    "Ejecución de pruebas funcionales y soporte a pipelines de automatización.",
                    "Preparación de datos de prueba y ejecución de suites automatizadas.",
                    "Colaboración con equipos Agile para mantener entregas estables.",
                ],
                "tech": "Jenkins  |  Bitbucket  |  Git  |  Agile",
            },
            {
                "company": "NTT DATA",
                "role": "QA Engineer",
                "period": "nov. 2023 - feb. 2024",
                "bullets": [
                    "Diseño y ejecución de casos manuales, pruebas smoke y validaciones de base de datos.",
                    "Registro y seguimiento de defectos durante sprints y ciclos de regresión.",
                ],
                "tech": "Jira  |  SQL  |  Scrum  |  Pruebas de regresión",
            },
            {
                "company": "BANORTE",
                "role": "QA Lead",
                "period": "may. 2023 - oct. 2023",
                "bullets": [
                    "Coordinación de pruebas funcionales y de regresión para aplicaciones bancarias.",
                    "Estimación de esfuerzos y colaboración con desarrollo y proveedores externos.",
                    "Gestión de defectos y documentación del ciclo de pruebas.",
                ],
                "tech": "Pruebas funcionales  |  Regresión  |  Gestión de defectos",
            },
            {
                "company": "OXXO",
                "role": "QA Engineer",
                "period": "abr. 2022 - feb. 2023",
                "bullets": [
                    "Pruebas funcionales y de regresión sobre sistemas de punto de venta.",
                    "Seguimiento de defectos y colaboración con desarrollo dentro de procesos Agile.",
                ],
                "tech": "Pruebas funcionales  |  Regresión  |  Agile",
            },
        ],
        "projects_title": "PROYECTOS DE QA SELECCIONADOS",
        "projects": [
            ("Booking UI Automation", "Playwright, TypeScript, datos JSON y cobertura de búsqueda y filtros.", "github.com/mralexis99r/Booking-automation"),
            ("Selenium Java Automation", "Java 17, Selenium, TestNG, Page Objects y datos de prueba JSON.", "github.com/mralexis99r/selenium-java-automation"),
        ],
        "education_title": "EDUCACIÓN",
        "education": "Ingeniería en Computación Administrativa  |  Universidad TecMilenio  |  2017 - 2022",
        "languages_title": "IDIOMAS",
        "languages": "Español C1-C2  |  Inglés B2-C1",
    },
}


def styles():
    base = getSampleStyleSheet()
    return {
        "name": ParagraphStyle("Name", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=10, leading=12, textColor=TEAL, tracking=1.1, spaceAfter=3),
        "hero": ParagraphStyle("Hero", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=31, leading=33, textColor=NAVY, tracking=-0.5, spaceAfter=3),
        "focus": ParagraphStyle("Focus", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=7.7, leading=10, textColor=MUTED, tracking=1.25, spaceAfter=11),
        "contact": ParagraphStyle("Contact", parent=base["Normal"], fontName="Helvetica", fontSize=7.4, leading=10.5, textColor=MUTED),
        "section": ParagraphStyle("Section", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=8, leading=10, textColor=TEAL, tracking=1.25, spaceBefore=7, spaceAfter=6),
        "body": ParagraphStyle("Body", parent=base["Normal"], fontName="Helvetica", fontSize=8.6, leading=12.3, textColor=INK),
        "company": ParagraphStyle("Company", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=10.2, leading=12, textColor=NAVY),
        "role": ParagraphStyle("Role", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=8.2, leading=10, textColor=TEAL),
        "period": ParagraphStyle("Period", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=7.3, leading=9, textColor=MUTED, alignment=TA_RIGHT),
        "bullet": ParagraphStyle("Bullet", parent=base["Normal"], fontName="Helvetica", fontSize=7.8, leading=10.5, textColor=INK, leftIndent=8, firstLineIndent=-8, spaceAfter=2),
        "tech": ParagraphStyle("Tech", parent=base["Normal"], fontName="Helvetica", fontSize=6.8, leading=9, textColor=MUTED),
        "small": ParagraphStyle("Small", parent=base["Normal"], fontName="Helvetica", fontSize=7.2, leading=10, textColor=INK),
        "small_bold": ParagraphStyle("SmallBold", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=7.4, leading=10, textColor=NAVY),
    }


def section_heading(text, s):
    title = Paragraph(text, s["section"])
    rule = Table([[title, ""]], colWidths=[54 * mm, None])
    rule.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LINEBELOW", (1, 0), (1, 0), 0.6, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return rule


def capability_grid(items, s):
    rows = []
    for index in range(0, len(items), 4):
        row = [Paragraph(item, s["small"]) for item in items[index:index + 4]]
        while len(row) < 4:
            row.append("")
        rows.append(row)
    table = Table(rows, colWidths=[(PAGE_W - LEFT - RIGHT) / 4] * 4)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SOFT),
        ("BOX", (0, 0), (-1, -1), 0.5, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return table


def experience_block(item, labels, s):
    current = f"  <font color='#087F83'>{item.get('current', '')}</font>" if item.get("current") else ""
    head = Table([
        [Paragraph(f"{item['company']}{current}", s["company"]), Paragraph(item["period"], s["period"])],
        [Paragraph(item["role"], s["role"]), ""],
    ], colWidths=[120 * mm, None])
    head.setStyle(TableStyle([
        ("SPAN", (1, 0), (1, 1)),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    parts = [head, Spacer(1, 3)]
    parts.extend(Paragraph(f"<font color='#087F83'>-</font> {bullet}", s["bullet"]) for bullet in item["bullets"])
    parts.append(Paragraph(f"<b>{labels['environment']}:</b> {item['tech']}", s["tech"]))
    parts.append(Spacer(1, 7))
    return KeepTogether(parts)


def draw_page(canvas, doc, locale):
    labels = DATA[locale]
    page = canvas.getPageNumber()
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, PAGE_H - 5 * mm, PAGE_W, 5 * mm, fill=1, stroke=0)
    canvas.setStrokeColor(LINE)
    canvas.line(LEFT, 11 * mm, PAGE_W - RIGHT, 11 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 6.5)
    canvas.drawString(LEFT, 7.5 * mm, "CRISTIAN ALEXIS ROMAN SANTIAGO  /  QA ENGINEER")
    footer = f"{labels['label']}  /  {page} / 2"
    canvas.drawRightString(PAGE_W - RIGHT, 7.5 * mm, footer)
    canvas.restoreState()


def build_resume(locale: str, output_path: Path):
    labels = DATA[locale]
    s = styles()
    frame = Frame(LEFT, BOTTOM, PAGE_W - LEFT - RIGHT, PAGE_H - TOP - BOTTOM, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    template = PageTemplate(id="resume", frames=[frame], onPage=lambda canvas, doc: draw_page(canvas, doc, locale))
    doc = BaseDocTemplate(str(output_path), pagesize=A4, leftMargin=LEFT, rightMargin=RIGHT, topMargin=TOP, bottomMargin=BOTTOM, title=f"Cristian Alexis Roman Santiago - {labels['title']}", author="Cristian Alexis Roman Santiago", subject="QA Engineer resume")
    doc.addPageTemplates([template])

    identity = [
        Paragraph("CRISTIAN ALEXIS ROMAN SANTIAGO", s["name"]),
        Paragraph(labels["title"], s["hero"]),
        Paragraph(labels["focus"], s["focus"]),
        Paragraph(labels["contact"], s["contact"]),
        Paragraph(labels["links"], s["contact"]),
    ]
    portrait = Image(str(PHOTO), width=27 * mm, height=34 * mm)
    header = Table([[identity, portrait]], colWidths=[PAGE_W - LEFT - RIGHT - 32 * mm, 32 * mm])
    header.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("BOX", (1, 0), (1, 0), 0.7, LINE),
    ]))

    story = [
        header,
        Spacer(1, 6),
        section_heading(labels["summary_title"], s),
        Spacer(1, 4),
        Paragraph(labels["summary"], s["body"]),
        Spacer(1, 4),
        section_heading(labels["strengths_title"], s),
        Spacer(1, 4),
        capability_grid(labels["strengths"], s),
        Spacer(1, 5),
        section_heading(labels["experience_title"], s),
        Spacer(1, 5),
    ]
    story.extend(experience_block(item, labels, s) for item in labels["experience"][:3])
    story.append(PageBreak())
    story.append(section_heading(labels["experience_title"], s))
    story.append(Spacer(1, 5))
    story.extend(experience_block(item, labels, s) for item in labels["experience"][3:])
    story.append(section_heading(labels["projects_title"], s))
    story.append(Spacer(1, 4))
    for name, description, url in labels["projects"]:
        project_url = Paragraph(f"<link href='https://{url}' color='#5D6C72'>{url}</link>", s["tech"])
        project = Table([[Paragraph(name, s["small_bold"]), Paragraph(description, s["small"]), project_url]], colWidths=[43 * mm, 78 * mm, None])
        project.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LINEBELOW", (0, 0), (-1, -1), 0.45, LINE),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(project)
    story.append(Spacer(1, 5))
    details = Table([
        [Paragraph(labels["education_title"], s["section"]), Paragraph(labels["languages_title"], s["section"])],
        [Paragraph(labels["education"], s["small"]), Paragraph(labels["languages"], s["small"])],
    ], colWidths=[(PAGE_W - LEFT - RIGHT) * 0.62, None])
    details.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEABOVE", (0, 0), (-1, 0), 0.6, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(details)
    doc.build(story)


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    english = OUTPUT_DIR / "Cristian-Alexis-Roman-Santiago-QA-Engineer-EN.pdf"
    spanish = OUTPUT_DIR / "Cristian-Alexis-Roman-Santiago-QA-Engineer-ES.pdf"
    build_resume("en", english)
    build_resume("es", spanish)

    copy2(english, PUBLIC_DIR / "Cristian-Alexis-Roman-Santiago-QA-Engineer.pdf")
    copy2(spanish, PUBLIC_DIR / "Cristian-Alexis-Roman-Santiago-QA-Engineer-ES.pdf")
    print(english)
    print(spanish)


if __name__ == "__main__":
    main()
