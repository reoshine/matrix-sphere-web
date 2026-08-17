<template>
  <a
    class="skip-link"
    href="#main-content"
    @click.prevent="skipToMain"
  >
    跳转到主要内容
  </a>
</template>

<script>
export default {
  name: 'SkipLink',
  methods: {
    skipToMain() {
      const mainContent = document.getElementById('main-content')
      if (mainContent) {
        mainContent.focus()
        mainContent.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }
}
</script>

<style scoped>
.skip-link {
  position: absolute;
  top: -100px;
  left: 0;
  background: var(--color-primary, #2c58b4);
  color: #fff;
  padding: 8px 16px;
  z-index: 10000;
  font-size: 14px;
  text-decoration: none;
  border-radius: 0 0 4px 0;
  transition: top 0.2s ease;
}

.skip-link:focus {
  top: 0;
  outline: 2px solid var(--color-primary-light, #60a5fa);
  outline-offset: 2px;
}
</style>
