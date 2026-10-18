<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-block">
        <p class="eyebrow">Proyecto 2 — Catálogos temáticos</p>
        <p class="footer-course">Sistemas Distribuidos · Universidad Nacional de Costa Rica (UNA)</p>
      </div>
      <div class="footer-block footer-author">
        <p class="footer-name">Isaac Brenes</p>
        <p class="mono footer-meta">Cédula 119040860 · Tema 6: Catálogo de edificios más altos</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--border);
  background: var(--panel);
  padding: 24px 0;
  margin-top: auto;
}

.footer-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.footer-course {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin: 4px 0 0;
}

.footer-author {
  text-align: right;
}

.footer-name {
  font-family: var(--font-display);
  font-weight: 600;
  margin: 0;
}

.footer-meta {
  color: var(--text-muted);
  font-size: 0.78rem;
  margin: 4px 0 0;
}

@media (max-width: 560px) {
  .footer-inner {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  .footer-author {
    text-align: left;
  }
}
</style>
