Create a SIMPLE but PROFESSIONAL React-based documentation builder platform named "QubeDocs".

IMPORTANT:
Keep the UI clean, lightweight, and functional.
Do NOT overcomplicate the design.
Focus on:
- working functionality
- clean developer UI
- responsive layout
- documentation management
- static export system

The platform should feel similar to:
- GitBook
- Notion Docs
- Vercel Docs
- Tailwind Docs

====================================================
TECH STACK
====================================================

Build using:
- React
- Tailwind CSS
- Simple local state management
- No backend required
- Fully static compatible

The project should be easy to understand and beginner-friendly.

====================================================
CORE GOAL
====================================================

Users can:
- create documentation pages
- delete pages
- edit content
- manage sidebar navigation
- write markdown/text
- upload images
- preview documentation
- export complete documentation website as static HTML

====================================================
MAIN LAYOUT
====================================================

Use a 3-panel layout:

LEFT SIDEBAR:
- page navigation
- add new page button
- delete page button
- page list
- active page highlight

CENTER EDITOR:
- page title input
- markdown/text editor
- toolbar
- image upload
- auto save

RIGHT PREVIEW PANEL:
- live documentation preview
- rendered markdown
- images preview
- code blocks preview

====================================================
TOP NAVBAR
====================================================

Navbar should contain:
- QubeDocs logo
- Search input
- Export HTML button
- Theme toggle
- Save status

Sticky navbar height:
- 60px

====================================================
SIDEBAR FEATURES
====================================================

Sidebar should support:
- add page
- delete page
- rename page
- nested pages (simple)
- active page state
- scrollable navigation

Example pages:
- Introduction
- Installation
- Setup
- API
- Examples

====================================================
EDITOR FEATURES
====================================================

Editor must support:

TEXT:
- headings
- bold
- italic
- lists
- code blocks
- links

MEDIA:
- upload image
- image preview
- drag and drop upload

CONTENT MANAGEMENT:
- auto-save to localStorage
- page switching
- create page
- delete page
- update page content

====================================================
PREVIEW PANEL
====================================================

Preview should render:
- headings
- markdown
- images
- code blocks
- lists
- links

Preview must update live while typing.

====================================================
EXPORT FEATURE
====================================================

IMPORTANT FEATURE:

Add:
"Export Documentation"

When clicked:
- generate static HTML files
- generate sidebar navigation
- generate CSS file
- generate assets folder
- download ZIP

Generated structure:
docs/
   index.html
   installation.html
   api.html
   style.css
   assets/

The exported documentation website should:
- work offline
- have sidebar navigation
- open in browser directly
- not require React after export

====================================================
COMPONENTS
====================================================

Create reusable components:

- Sidebar
- Navbar
- Editor
- Preview
- Toolbar
- PageTree
- ExportModal
- ImageUploader

====================================================
STYLING
====================================================

Design style:
- minimal
- modern
- clean
- developer-focused

Use:
- soft shadows
- rounded corners
- dark/light mode
- clean spacing
- modern typography

Color palette:
- dark background
- indigo accent
- gray surfaces
- white text

====================================================
RESPONSIVE DESIGN
====================================================

Desktop:
- full 3-panel layout

Tablet:
- collapsible sidebar

Mobile:
- stacked layout
- floating menu button

====================================================
STATE MANAGEMENT
====================================================

Store documentation data in:
- localStorage

Structure example:

{
  pages: [
    {
      id: "intro",
      title: "Introduction",
      content: "# Welcome"
    }
  ]
}

====================================================
FUNCTIONALITY REQUIREMENTS
====================================================

Must work:
- without backend
- fully static
- browser only

Must support:
- adding pages
- deleting pages
- editing pages
- switching pages
- exporting documentation
- image uploads
- markdown preview

====================================================
EXPORT SYSTEM DETAILS
====================================================

The export system should:
- convert markdown to HTML
- create sidebar links automatically
- include CSS styles
- generate clean static pages
- package all files into ZIP

Use:
- JSZip
- markdown parser

====================================================
UI STYLE REFERENCE
====================================================

Keep UI similar to:
- modern SaaS apps
- Vercel dashboard
- GitBook editor
- Notion simplicity

Avoid:
- overly complex enterprise UI
- too many animations
- cluttered layouts

====================================================
FINAL OUTPUT
====================================================

Generate:
- React app structure
- Tailwind UI
- functional components
- export system logic
- markdown preview
- page management system
- localStorage support
- clean responsive design

The final result should be:
- simple
- beautiful
- usable
- exportable
- functional
- scalable later