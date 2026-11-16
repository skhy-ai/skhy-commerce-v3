import re

# --- RESIDENTIAL.TSX ---
with open(r'c:\Projects\skhyai-website\skhy-ai-website-main\src\pages\Residential.tsx', 'r', encoding='utf-8') as f:
    res_content = f.read()

# Remove Infographic
info_search = r"\{\/\*\s*───\s*INFOGRAPHIC\s*───\s*\*\/\}.*?<\/section>"
res_content = re.sub(info_search, "", res_content, flags=re.DOTALL)

# Add py-32 to sections
res_content = res_content.replace('className="anduril-section relative"', 'className="anduril-section relative py-32"')

with open(r'c:\Projects\skhyai-website\skhy-ai-website-main\src\pages\Residential.tsx', 'w', encoding='utf-8') as f:
    f.write(res_content)

# --- INDUSTRIES.TSX ---
with open(r'c:\Projects\skhyai-website\skhy-ai-website-main\src\pages\Industries.tsx', 'r', encoding='utf-8') as f:
    ind_content = f.read()

# Add py-32 to sections
ind_content = ind_content.replace('className="py-16 max-w-7xl', 'className="py-32 max-w-7xl')
ind_content = ind_content.replace('className="py-20 max-w-7xl', 'className="py-32 max-w-7xl')
ind_content = ind_content.replace('className="anduril-section relative"', 'className="anduril-section relative py-32"')
ind_content = ind_content.replace('className="anduril-section relative bg-black"', 'className="anduril-section relative py-32 bg-black"')

# Replace single video with two videos
video_search = r"\{\/\*\s*Embedded Video Player\s*\*\/\}.*?<\/RevealBlock>"
video_replace = """{/* Embedded Video Players */}
          <RevealBlock delay={500}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <div className="rounded-none overflow-hidden border border-white/10 aspect-video relative shadow-2xl group">
                <div className="absolute top-4 left-4 z-10 bg-black/80 px-3 py-1 border border-white/20 text-xs font-bold tracking-widest text-[#00f0ff] backdrop-blur-sm">PIPELINE DRONE INSPECTION</div>
                <iframe
                  src="https://www.youtube.com/embed/3DSAmV__CD8?autoplay=0&mute=1&controls=1&rel=0&modestbranding=1"
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Pipeline Drone Inspection"
                />
              </div>
              <div className="rounded-none overflow-hidden border border-white/10 aspect-video relative shadow-2xl group">
                <div className="absolute top-4 left-4 z-10 bg-black/80 px-3 py-1 border border-white/20 text-xs font-bold tracking-widest text-[#00f0ff] backdrop-blur-sm">DTS SIGNAL ANALYSIS</div>
                <iframe
                  src="https://www.youtube.com/embed/G0LBD2lDId8?autoplay=0&mute=1&controls=1&rel=0&modestbranding=1"
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="DTS Signal Analysis"
                />
              </div>
            </div>
          </RevealBlock>"""
ind_content = re.sub(video_search, video_replace, ind_content, flags=re.DOTALL)

with open(r'c:\Projects\skhyai-website\skhy-ai-website-main\src\pages\Industries.tsx', 'w', encoding='utf-8') as f:
    f.write(ind_content)

print("Updated Residential.tsx and Industries.tsx padding and videos.")
