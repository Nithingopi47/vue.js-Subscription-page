<!-- src/App.vue -->
<template>
  <div id="app">
    <!-- Navigation Bar -->
    <nav class="navbar is-primary" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <div class="navbar-item">
          <span class="has-text-weight-bold is-size-4">Subscription Manager</span>
        </div>
      </div>
      <div class="navbar-menu">
        <div class="navbar-end">
          <div class="navbar-item">
            <div class="buttons">
              <a class="button is-light">
                <strong>Account</strong>
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="main-content">
      <subscription-page></subscription-page>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="content has-text-centered">
        <p>
          © 2024 Subscription Manager. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
import SubscriptionPage from './components/SubscriptionPage.vue'

export default {
  name: 'App',
  components: {
    SubscriptionPage
  }
}
</script>

<style>
#app {
  font-family: 'Arial', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  margin-bottom: 2rem;
}

.main-content {
  flex: 1;
}

.footer {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f5f5f5;
}

/* Responsive adjustments */
@media screen and (max-width: 768px) {
  .navbar-menu {
    padding: 0.5rem;
  }
}
</style>
