import re

with open(r'c:\Projects\skhyai-website\skhy-ai-website-main\src\pages\Industries.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Revert Section 3 (Pipeline GIS videos back to the single Pa2i2aB3DZk video)
video_grid_search = r"\{\/\*\s*Embedded Video Players\s*\*\/\}.*?<\/RevealBlock>"
video_grid_replace = """{/* Embedded Video Player */}
          <RevealBlock delay={500}>
            <div className="max-w-4xl mx-auto rounded-none overflow-hidden border border-white/10 aspect-video relative shadow-2xl">
              <iframe
                src="https://www.youtube.com/embed/Pa2i2aB3DZk?autoplay=0&mute=1&controls=1&rel=0&modestbranding=1"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Pipeline Asset Management AI with Morrigan GIS"
              />
            </div>
          </RevealBlock>"""
content = re.sub(video_grid_search, video_grid_replace, content, flags=re.DOTALL)

# Revert DTS Card Video
dts_video_search = r"\s*\{\/\*\s*DTS Video\s*\*\/\}\s*<div className=\"rounded-none overflow-hidden border border-white\/10 aspect-video relative shadow-xl mt-6 mb-8 group\">.*?<\/div>"
content = re.sub(dts_video_search, "", content, flags=re.DOTALL)

# Revert DAS Card Video
das_video_search = r"\s*\{\/\*\s*DAS Video\s*\*\/\}\s*<div className=\"rounded-none overflow-hidden border border-white\/10 aspect-video relative shadow-xl mt-6 mb-8 group\">.*?<\/div>"
content = re.sub(das_video_search, "", content, flags=re.DOTALL)


with open(r'c:\Projects\skhyai-website\skhy-ai-website-main\src\pages\Industries.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Reverted video embeddings in Industries.tsx.")
