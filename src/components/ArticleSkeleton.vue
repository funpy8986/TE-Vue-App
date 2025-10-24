<template>
  <div class="skeleton-container">
    <main>
      <header class="page-header">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-subtitle"></div>
        <div class="skeleton skeleton-meta"></div>
      </header>
      <section class="article-body">
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text short"></div>
        <br />
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text medium"></div>
      </section>
    </main>
    <aside>
      <div class="sidebar-sticky-container">
        <div class="sidebar-content">
          <div class="skeleton skeleton-sidebar-title"></div>
          <div class="skeleton skeleton-card"></div>
          <div class="skeleton skeleton-card"></div>
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.skeleton-container {
  display: grid;
  grid-template-columns: 1fr;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

@media (min-width: 1024px) {
  .skeleton-container {
    grid-template-columns: 2fr 1fr;
    gap: 60px;
    padding: 40px;
  }
}

main {
  max-width: 740px;
}

.page-header {
  margin-bottom: 60px;
}

.skeleton {
  background-color: var(--border-color);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.skeleton::before {
  content: '';
  position: absolute;
  top: 0;
  left: -150%;
  height: 100%;
  width: 150%;
  background: linear-gradient(
    to right,
    transparent 0%,
    color-mix(in srgb, var(--background-color) 50%, transparent) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
}

.skeleton-title {
  width: 80%;
  height: 48px;
  margin-bottom: 16px;
}

.skeleton-subtitle {
  width: 60%;
  height: 22px;
  margin-bottom: 24px;
}

.skeleton-meta {
  width: 40%;
  height: 14px;
}

.article-body {
  font-size: 18px;
  line-height: 1.7;
}

.skeleton-text {
  width: 100%;
  height: 1.2em;
  margin-bottom: 1.2em;
}

.skeleton-text.medium {
  width: 90%;
}
.skeleton-text.short {
  width: 75%;
}

.sidebar-content {
  border-left: 1px solid transparent; /* Match layout */
  padding-left: 40px;
  padding-top: 40px;
}

.sidebar-content .skeleton-sidebar-title {
  width: 60%;
  height: 24px;
  margin-bottom: 24px;
}

.sidebar-content .skeleton-card {
  width: 100%;
  height: 200px;
  margin-bottom: 20px;
}

@media (max-width: 1023px) {
  .sidebar-content {
    display: none; /* Hide sidebar skeleton on mobile */
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>