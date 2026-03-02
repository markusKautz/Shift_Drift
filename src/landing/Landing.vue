<template>
  <div class="landing-page modern">
    <!-- Starfield Background -->
    <canvas ref="starfield" class="starfield"></canvas>

    <!-- Intro Logo Flash -->
    <transition name="fade">
      <div v-if="showIntro" class="intro-overlay">
        <video 
          ref="introVideo"
          src="/video/Logo_Pixelorum_Kontrast_Bunt.mp4" 
          autoplay 
          muted 
          playsinline
          class="intro-video"
          @ended="handleVideoEnd"
        ></video>
      </div>
    </transition>

    <div class="content-wrapper">
      <div class="content" :class="{ 'fade-in': !showIntro }">
        <h1 class="title">SHIFT DRIFT</h1>
        <p class="subtitle">A modular refactor of the classic arcade experience.</p>
        
        <div class="about-section">
          <h2>Technical Demonstration</h2>
          <p>
            <strong>Shift Drift</strong> is a modular refactor of the classic <strong>Asteroids</strong> 
            arcade game, developed entirely through AI-driven <strong>"Vibe Coding."</strong> It serves 
            as a technical demonstration of high-precision physics, adaptive game logic, and 
            real-time data synchronization within a modern web architecture.
          </p>
        </div>

        <div class="features-header">
          <h2>Game Features</h2>
        </div>

        <div class="features-grid" :class="{ 'collapsed': !showAllFeatures }">
          <div class="feature-card">
            <h3>Aesthetic Modes</h3>
            <p>Switch between classic 'Retro' and glowing 'Modern' themes.</p>
          </div>
          <div class="feature-card">
            <h3>Archenemy</h3>
            <p>Advanced rival ship with adaptive firing patterns.</p>
          </div>
          <div class="feature-card">
            <h3>Progression</h3>
            <p>Unlock multishot and shields through tactical gameplay.</p>
          </div>
          <div class="feature-card">
            <h3>Touch Controls</h3>
            <p>Optimized for mobile and tablet with a tactile HUD.</p>
          </div>
          <div class="feature-card">
            <h3>Global Leaderboard</h3>
            <p>Compete with players worldwide for the highest score.</p>
          </div>
          <div class="feature-card">
            <h3>Synthesized Audio</h3>
            <p>Dynamic soundscapes powered by the Web Audio API.</p>
          </div>
        </div>

        <button 
          class="view-more-btn" 
          @click="showAllFeatures = !showAllFeatures"
          v-if="!showAllFeatures"
        >
          VIEW ALL FEATURES <span class="arrow">▼</span>
        </button>

        <div class="accordion-wrapper" :class="{ 'is-open': showPhilosophy }">
          <button 
            class="accordion-toggle" 
            @click="showPhilosophy = !showPhilosophy"
            aria-haspopup="true"
            :aria-expanded="showPhilosophy"
            aria-controls="philosophy-content"
          >
            <span class="toggle-icon">◈</span>
            Design Philosophy & Agentic Showcase
            <span class="chevron" :class="{ 'rotate': showPhilosophy }">▼</span>
          </button>
          
          <div 
            id="philosophy-content"
            class="accordion-content"
            role="region"
            aria-labelledby="philosophy-toggle"
          >
            <div class="description-section">
              <div class="philosophy-text">
                <p>
                  <strong>Shift Drift</strong> is a project of <strong>Pixelorum Webentwicklung e. U.</strong>, 
                  conceived as an <strong>Agentic-First</strong> showcase. By leveraging 
                  <strong class="model-highlight">Antigravity</strong>, this project demonstrates how 
                   a single developer can act as an <strong>Architect and Orchestrator</strong>, directing 
                  autonomous agents to handle implementation, refactoring, and verification.
                </p>
                <p>
                  This isn't just about code generation; it's about <strong>contextual awareness</strong>. 
                  The entire codebase was evolved over <strong>~8 hours</strong> of high-velocity development. 
                  While <strong class="model-highlight">Gemini 3 and 3.1 Flash</strong> models handled rapid prototyping, 
                  <strong class="model-highlight">Gemini 3.1 Pro</strong> and <strong class="model-highlight">Claude Opus 4.6</strong> 
                  were orchestrated for complex architectural decisions and logic-heavy refactors.
                </p>
              </div>

              <div class="how-to-section">
                <h3>The Vibe Coding Workflow</h3>
                <p>
                  Developing with Antigravity transcends traditional chat-based AI. It follows a rigorous 
                  <strong>Planning → Execution → Verification</strong> cycle. The agent doesn't just write functions; 
                  it understands the <strong>entire workspace</strong>, allowing it to perform multi-file changes 
                  with consistent architectural integrity.
                </p>
                <p>
                  The "vibe" isn't about being vague, it's about <strong>strategic intent</strong>. As the human 
                  orchestrator, I set the technical boundaries and review high-level <strong>Implementation Plans</strong>. 
                  The agent then executes the heavy lifting: refactoring legacy state management, integrating persistence 
                  layers, and validating changes through real-time feedback loops.
                </p>
              </div>

              <div class="tech-stack-section">
                <h3>Production-Grade Tech Stack</h3>
                <p>
                  <strong>Vite + Vue 3:</strong> Reactive component architecture with instant HMR.<br>
                  <strong>Supabase:</strong> Real-time PostgreSQL database for global leaderboards.<br>
                  <strong>Vercel:</strong> Edge-optimized hosting with seamless CI/CD integration.<br>
                  <strong>Web Audio & Canvas:</strong> Low-level browser APIs for high-performance rendering and synthesis.
                </p>
              </div>

              <div class="stats-badge">
                <span class="stats-number">4,400+</span>
                <span class="stats-label">Lines of AI-Developed Code</span>
                <span class="stats-note">*not including node_modules, build files and json files</span>
              </div>
            </div>
          </div>
        </div>

        <div class="repo-section">
          <h2>Technical Repository</h2>
          <p>
            Explore the complete codebase, implementation plans, and agentic workflows 
            on GitHub. This project is fully open source as a reference for 
            modern AI-orchestrated development.
          </p>
          <a href="https://github.com/markusKautz/Shift_Drift" target="_blank" class="github-link">
            VIEW ON GITHUB_
          </a>
        </div>

        <div class="action-section">
          <a href="/game.html" class="play-button">LAUNCH GAME</a>
        </div>
      </div>

      <!-- Minimalist Branding Footer -->
      <footer class="branding-footer">
        <div class="footer-copyright">&copy; 2026 Pixelorum Webentwicklung e. U.</div>
        <div class="footer-links">
          <button class="footer-link" @click="openModal('impressum')">Legal Notice</button>
          <span class="separator">|</span>
          <button class="footer-link" @click="openModal('datenschutz')">Privacy Policy</button>
        </div>
      </footer>
    </div>

    <!-- Legal Modal -->
    <transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <button class="close-btn" @click="closeModal">&times;</button>
          <h2>{{ modalTitle }}</h2>
          <div class="modal-body">
            <template v-if="modalType === 'impressum'">
              <div class="legal-header">
                <div>
                  <h3>Legal Notice according to § 5 ECG / § 14 UGB</h3>
                  <p><strong>Pixelorum Webentwicklung e. U.</strong></p>
                  <p>Owner: Markus Kautz</p>
                </div>
                <img src="/img/logo.svg" class="legal-logo" alt="Pixelorum Logo">
              </div>
              <p>Johann Strauß-Gasse 1/3/4</p>
              <p>3426 Muckendorf an der Donau</p>
              <p>Austria</p>
              <br>
              <p><strong>Contact:</strong></p>
              <p>Email: <a href="mailto:markus.kautz@pixelorum.at" class="legal-link">markus.kautz@pixelorum.at</a></p>
              <p>Web: <a href="https://www.pixelorum.at" target="_blank" class="legal-link">www.pixelorum.at</a></p>
              <br>
              <p><strong>Company Object:</strong> IT Services / Web Development</p>
              <p><strong>Chamber Membership:</strong> Austrian Federal Economic Chamber (WKO)</p>
              <p><strong>Commercial Register Number:</strong> FN 639908t</p>
              <p><strong>Commercial Court:</strong> Landesgericht St. Pölten</p>
              <br>
              <p><strong>Online Dispute Resolution:</strong></p>
              <p>Consumers have the opportunity to submit complaints to the EU's online dispute resolution platform: http://ec.europa.eu/odr. You can also send any complaints to the email address provided above.</p>
            </template>
            <template v-else>
              <h3>Privacy Policy</h3>
              <p>The protection of your personal data is of particular concern to us. We process your data exclusively on the basis of the legal provisions (GDPR/DSGVO, TKG 2021).</p>
              <br>
              <p><strong>1. Controller:</strong></p>
              <p>Markus Kautz (Pixelorum Webentwicklung e. U.). Contact details as stated in the Legal Notice.</p>
              <br>
              <p><strong>2. Hosting & Infrastructure (Vercel):</strong></p>
              <p>Our website is hosted on Vercel. The provider is Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA.</p>
              <p>Vercel collects and stores server log files (IP address, browser type, device info, visited pages) to ensure the technical reliability and security of the site. This processing is based on our legitimate interest (Art. 6 (1) (f) GDPR).</p>
              <p>Data is transferred to the USA. To ensure an adequate level of data protection, we have entered into a Data Processing Agreement (DPA) including Standard Contractual Clauses (SCCs) with Vercel.</p>
              <br>
              <p><strong>3. Database & Leaderboard (Supabase):</strong></p>
              <p>To provide a global leaderboard, game scores are transmitted to a database provided by Supabase Inc., 970 1st St Ave, San Francisco, CA 94109, USA. The database servers are located in Ireland (EU). We store the name you enter at the start of the game, the score achieved, the duration of the game session, and a timestamp. We do not require real names; you are free to use a pseudonym. Your leaderboard entry is stored for the duration of the project's availability.</p>
              <p>This data processing is based on your consent (Art. 6 (1) (a) GDPR), which is given when you actively enter your name and start the game, knowing that your score will be automatically submitted upon completion. You can withdraw your consent and request the deletion of your entry at any time by contacting us. We have concluded a Data Processing Agreement (DPA / Auftragsverarbeitungsvertrag) with Supabase to ensure your data is processed securely and in compliance with GDPR. Additionally, Standard Contractual Clauses (SCCs) are in place to cover any potential data transfers to the USA.</p>
              <br>
              <p><strong>4. Local Storage:</strong></p>
              <p>To provide you with a consistent experience, we use "Local Storage" on your device. This allows us to remember your theme preference (Modern/Retro) and your personal local high scores. This specific data remains on your device. Since this storage is strictly necessary to provide the explicitly requested service (the game), no prior consent banner is required under § 165 (3) TKG 2021.</p>
              <br>
              <p><strong>5. Server Logs:</strong></p>
              <p>Additional technical logs may be generated for error analysis. This processing is also based on Art. 6 (1) (f) GDPR. Data is stored only as long as necessary for technical reasons and is not shared with third parties.</p>
              <br>
              <p><strong>6. Your Rights:</strong></p>
              <p>You generally have the rights to information, correction, deletion, restriction, data portability, revocation (right to withdraw consent), and objection regarding your stored data. You can request the deletion of your leaderboard entry at any time by contacting us.</p>
              <br>
              <p><strong>7. Right to Complaint:</strong></p>
              <p>If you believe that the processing of your data violates data protection law or your data protection claims have been violated in any other way, you can lodge a complaint with the supervisory authority. In Austria, this is:</p>
              <p>Österreichische Datenschutzbehörde<br>
              Barichgasse 40-42<br>
              1030 Wien, Austria<br>
              Website: <a href="https://www.dsb.gv.at" target="_blank" class="legal-link">www.dsb.gv.at</a></p>
            </template>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const showIntro = ref(true);
const introVideo = ref(null);
const starfield = ref(null);
const showAllFeatures = ref(false);
let animationFrameId = null;
let resizeHandler = null;

const showPhilosophy = ref(false);
const showModal = ref(false);
const modalType = ref('');
const modalTitle = ref('');

const handleVideoEnd = () => {
  showIntro.value = false;
};

const openModal = (type) => {
  modalType.value = type;
  modalTitle.value = type === 'impressum' ? 'LEGAL NOTICE' : 'PRIVACY POLICY';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

// Starfield Logic
const initStarfield = () => {
  const canvas = starfield.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width, height;
  const stars = [];
  const starCount = 200;

  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };

  class Star {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.z = Math.random() * width;
      this.size = Math.random() * 1.5;
      this.speed = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.z -= this.speed;
      if (this.z <= 0) this.reset();
    }
    draw() {
      const x = (this.x - width / 2) * (width / this.z) + width / 2;
      const y = (this.y - height / 2) * (width / this.z) + height / 2;
      const s = this.size * (width / this.z);
      const opacity = 1 - (this.z / width);
      
      ctx.fillStyle = `rgba(168, 85, 247, ${opacity * 0.4})`; // Balanced secondary color
      ctx.beginPath();
      ctx.arc(x, y, s, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(0, 212, 255, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < starCount; i++) stars.push(new Star());

  const animate = () => {
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, width, height);
    
    stars.forEach(star => {
      star.update();
      star.draw();
    });
    
    animationFrameId = requestAnimationFrame(animate);
  };

  resizeHandler = resize;
  window.addEventListener('resize', resizeHandler);
  resize();
  animate();
};

onMounted(() => {
  initStarfield();
  
  // Preload logo for instant modal visibility
  const img = new Image();
  img.src = '/img/logo.svg';

  setTimeout(() => {
    if (showIntro.value) showIntro.value = false;
  }, 5000);
});

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  if (resizeHandler) window.removeEventListener('resize', resizeHandler);
});
</script>

<style>
/* Global body overrides for the landing page */
html, body {
  overflow-y: auto !important;
  height: auto !important;
  min-height: 100vh;
}
</style>

<style scoped>
.landing-page {
  width: 100vw;
  min-height: 100vh;
  background-color: #0a0e1a;
  color: #fff;
  font-family: 'Orbitron', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

.starfield {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
}

/* Intro overlay: fixed so it never scrolls */
.intro-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: white;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.intro-video {
  max-width: 80%;
  max-height: 80%;
}

.fade-leave-active {
  transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-leave-to {
  opacity: 0;
}

.content {
  position: relative;
  z-index: 10;
  max-width: 900px;
  width: 100%;
  padding: 20px 40px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 1s ease-out;
}

.content.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.title {
  font-size: 4.5rem;
  font-weight: 700;
  margin-bottom: 4px;
  background: linear-gradient(135deg, #00d4ff, #a855f7);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.4));
  letter-spacing: 8px;
}

.subtitle {
  font-size: 1rem;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: 30px;
}

.description-section {
  background: rgba(255, 255, 255, 0.03);
  padding: 25px 30px;
  border-radius: 0 0 20px 20px;
  border: 1px solid rgba(0, 212, 255, 0.15);
  border-top: none;
  backdrop-filter: blur(15px);
}

.about-section {
  background: rgba(255, 255, 255, 0.03);
  padding: 25px 30px;
  border-radius: 20px;
  border: 1px solid rgba(0, 212, 255, 0.15);
  margin-bottom: 25px;
  backdrop-filter: blur(15px);
  text-align: left;
}

.about-section h2 {
  color: #00d4ff;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 15px;
}

.about-section p {
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  line-height: 1.6;
  opacity: 0.8;
}

.accordion-wrapper {
  margin-bottom: 35px;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s ease;
}

.accordion-toggle {
  width: 100%;
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  padding: 20px 30px;
  color: #fff;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.is-open .accordion-toggle {
  border-radius: 20px 20px 0 0;
  background: rgba(168, 85, 247, 0.2);
  border-color: rgba(0, 212, 255, 0.3);
}

.toggle-icon {
  color: #a855f7;
  font-size: 1.2rem;
}

.chevron {
  font-size: 0.8rem;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.chevron.rotate {
  transform: rotate(180deg);
}

.accordion-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.5s cubic-bezier(0.4, 0, 0.2, 1), 
              opacity 0.4s ease, 
              visibility 0.4s ease;
  overflow: hidden;
  visibility: hidden;
  opacity: 0;
}

.is-open .accordion-content {
  grid-template-rows: 1fr;
  visibility: visible;
  opacity: 1;
}

.accordion-content > div {
  overflow: hidden;
  min-height: 0;
}

.features-header {
  margin-bottom: 20px;
}

.features-header h2 {
  color: #00d4ff;
  font-size: 1.3rem;
  text-transform: uppercase;
  letter-spacing: 4px;
}

.description-section h2 {
  color: #00d4ff;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 20px;
}

.philosophy-text {
  line-height: 1.8;
  margin-bottom: 25px;
  font-family: 'Inter', sans-serif;
}

.philosophy-text p {
  margin-bottom: 15px;
  font-size: 0.95rem;
}

.model-highlight {
  color: #a855f7;
  text-shadow: 0 0 10px rgba(168, 85, 247, 0.2);
}

.how-to-section, .tech-stack-section {
  text-align: left;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.02);
  border-left: 3px solid #a855f7;
  border-radius: 4px;
}

.how-to-section h3, .tech-stack-section h3 {
  font-size: 0.8rem;
  color: #a855f7;
  text-transform: uppercase;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.how-to-section p, .tech-stack-section p {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  line-height: 1.6;
  opacity: 0.8;
}

.credit {
  margin-top: 15px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}

.credit strong {
  color: #a855f7;
}

.stats-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
  padding: 12px 24px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.1);
}

.stats-number {
  font-size: 1.8rem;
  font-weight: 800;
  color: #00d4ff;
  line-height: 1;
}

.stats-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 4px;
  opacity: 0.7;
}

.stats-note {
  font-size: 0.5rem;
  opacity: 0.4;
  margin-top: 8px;
  font-style: italic;
  font-family: 'Inter', sans-serif;
  max-width: 200px;
}

.view-more-btn {
  display: none; /* Hidden by default on desktop */
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid #00d4ff;
  color: #00d4ff;
  padding: 12px 24px;
  border-radius: 30px;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 2px;
  cursor: pointer;
  margin: 0 auto 35px;
  transition: all 0.3s ease;
}

.view-more-btn:hover {
  background: #00d4ff;
  color: #000;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
}

.view-more-btn .arrow {
  font-size: 0.6rem;
  margin-left: 8px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 35px;
}

.feature-card {
  background: rgba(168, 85, 247, 0.05);
  padding: 22px 18px;
  border: 1px solid rgba(168, 85, 247, 0.1);
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  backdrop-filter: blur(5px);
}

.feature-card:hover {
  transform: translateY(-10px) scale(1.02);
  background: rgba(168, 85, 247, 0.1);
  border-color: #00d4ff;
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.2);
}

.card-icon {
  font-size: 0.7rem;
  color: #00d4ff;
  margin-bottom: 15px;
  opacity: 0.5;
  letter-spacing: 2px;
}

.feature-card h3 {
  color: #fff;
  margin-bottom: 10px;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.feature-card p {
  font-size: 0.8rem;
  opacity: 0.5;
  line-height: 1.5;
}

.play-button {
  display: inline-block;
  background: transparent;
  color: #00d4ff;
  padding: 16px 45px;
  border-radius: 4px;
  font-weight: 700;
  text-decoration: none;
  font-size: 1.1rem;
  letter-spacing: 4px;
  border: 1px solid #00d4ff;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.play-button:hover {
  background: #00d4ff;
  color: #000;
  box-shadow: 0 0 40px rgba(0, 212, 255, 0.6);
  transform: translateY(-2px);
}


.repo-section {
  background: rgba(0, 212, 255, 0.03);
  padding: 30px;
  border-radius: 20px;
  border: 1px solid rgba(0, 212, 255, 0.15);
  margin-bottom: 35px;
  backdrop-filter: blur(15px);
  text-align: center;
}

.repo-section h2 {
  color: #00d4ff;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 15px;
}

.repo-section p {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  line-height: 1.6;
  opacity: 0.7;
  max-width: 600px;
  margin: 0 auto 20px;
}

.github-link {
  display: inline-block;
  color: #a855f7;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 2px;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.github-link:hover {
  color: #00d4ff;
  border-bottom-color: #00d4ff;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  padding: 40px 20px 20px;
  position: relative;
  z-index: 10;
}

.branding-footer {
  position: relative;
  width: 100%;
  padding: 25px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 10;
  margin-top: auto;
}

.footer-copyright {
  font-size: 0.7rem;
  opacity: 0.3;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.footer-links {
  display: flex;
  gap: 15px;
  align-items: center;
  z-index: 10;
}

.footer-link {
  background: none;
  border: none;
  color: #00d4ff;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  padding: 5px;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.footer-link:hover {
  opacity: 1;
  text-shadow: 0 0 8px #00d4ff;
}

.separator {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.2);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(25px);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.modal-content {
  background: rgba(10, 14, 26, 0.9);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  position: relative;
  padding: 40px;
  text-align: left;
  box-shadow: 0 0 100px rgba(0, 212, 255, 0.1);
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: #00d4ff;
  font-size: 2rem;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.close-btn:hover {
  transform: scale(1.2);
}

.modal-content h2 {
  background: linear-gradient(135deg, #00d4ff, #a855f7);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 25px;
  letter-spacing: 2px;
}

.modal-body {
  overflow-y: auto;
  max-height: 50vh;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  padding-right: 15px;
}

.modal-body::-webkit-scrollbar {
  width: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(0, 212, 255, 0.3);
  border-radius: 2px;
}

.modal-body h3 {
  color: #00d4ff;
  font-size: 1rem;
  margin-bottom: 15px;
  margin-top: 20px;
}

.legal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 5px;
}

.legal-header h3 {
  margin-top: 0 !important;
}

.legal-logo {
  width: 80px;
  height: auto;
  filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.1));
  background: #ffffff;
  padding: 8px;
  border-radius: 12px;
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.legal-link {
  color: #00d4ff;
  text-decoration: none;
  transition: text-shadow 0.3s ease;
}

.legal-link:hover {
  text-shadow: 0 0 8px #00d4ff;
  text-decoration: underline;
}

/* Modal Transitions */
.modal-enter-active, .modal-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

@media (max-width: 800px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  .features-grid.collapsed .feature-card:nth-child(n+3) {
    display: none;
  }
  .view-more-btn {
    display: inline-block;
  }
  .title {
    font-size: 3rem;
    letter-spacing: 4px;
  }
  .subtitle {
    font-size: 0.9rem;
    margin-bottom: 25px;
  }
  .description-section {
    padding: 20px;
    margin-bottom: 25px;
  }
  .content {
    padding: 10px 20px;
  }
  .modal-content {
    padding: 25px;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 2.2rem;
    letter-spacing: 2px;
  }
  .play-button {
    padding: 15px 30px;
    font-size: 0.9rem;
    letter-spacing: 2px;
  }
  .branding-footer {
    padding-bottom: 30px;
  }
}
</style>
