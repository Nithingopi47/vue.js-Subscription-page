<template>
  <div class="subscription-page">
    <section class="section">
      <!-- Loading State -->
      <div v-if="loading" class="loading-overlay">
        <b-loading is-full-page="false" active></b-loading>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Notification Component -->
      <b-notification 
        v-if="showNotification"
        :type="notificationType"
        has-icon
        @close="showNotification = false">
        {{ notificationMessage }}
      </b-notification>

      <!-- Main Subscription Card -->
      <div class="card main-card" v-if="!loading && !error">
        <div class="card-content">
          <!-- Plan Header with Three Dots Menu -->
          <div class="plan-header">
            <div class="level is-mobile">
              <div class="level-left">
                <div class="plan-title">
                  <h1 class="title is-3">{{ currentPlan?.item?.name || 'Loading...' }}</h1>
                  <b-tag 
                    :type="getStatusType"
                    size="is-medium">
                    {{ getStatusText }}
                  </b-tag>
                </div>
              </div>
              <div class="level-right">
                <!-- Three Dots Menu -->
                <b-dropdown 
                  position="is-bottom-left" 
                  aria-role="menu"
                  class="three-dots-menu">
                  <template #trigger>
                    <b-button
                      type="is-text"
                      icon-left="dots-vertical">
                    </b-button>
                  </template>

                  <b-dropdown-item 
                    v-if="showPauseOption"
                    @click="openModal('pause')">
                    <span class="icon-text">
                      <b-icon icon="pause"></b-icon>
                      <span>Pause Subscription</span>
                    </span>
                  </b-dropdown-item>

                  <b-dropdown-item 
                    v-if="showResumeOption"
                    @click="openModal('resume')">
                    <span class="icon-text">
                      <b-icon icon="play"></b-icon>
                      <span>Resume Subscription</span>
                    </span>
                  </b-dropdown-item>

                  <b-dropdown-item 
                    v-if="subscriptionStatus !== 'cancelled'"
                    @click="openModal('update')">
                    <span class="icon-text">
                      <b-icon icon="pencil"></b-icon>
                      <span>Update Subscription</span>
                    </span>
                  </b-dropdown-item>

                  <b-dropdown-item 
                    v-if="subscriptionStatus !== 'cancelled'"
                    @click="openModal('cancel')"
                    class="has-text-danger">
                    <span class="icon-text">
                      <b-icon icon="close"></b-icon>
                      <span>Cancel Subscription</span>
                    </span>
                  </b-dropdown-item>
                </b-dropdown>
              </div>
            </div>
            <p class="subtitle is-5 mt-2">
              {{ formattedAmount }}
            </p>
          </div>

          <!-- Scheduled Change Banner -->
          <div v-if="subscriptionDetails?.has_scheduled_changes && !isScheduledDatePassed" 
               class="notification is-info is-light mt-4">
            <p>
              <strong>Plan Update Scheduled</strong><br>
              Your subscription will be updated on {{ formatDate(subscriptionDetails.change_scheduled_at) }}
            </p>
          </div>

          <!-- Payment Reminder Banner -->
          <div v-if="subscriptionDetails?.has_scheduled_changes && !isScheduledDatePassed && planUpdateAmountDifference > 0"
               class="notification is-warning is-light mt-4">
            <p>
              <strong>Payment Required for Plan Update</strong><br>
              To ensure your plan update takes effect, please pay ₹{{ planUpdateAmountDifference.toFixed(2) }} 
              (difference between current and new plan) before {{ formatDate(subscriptionDetails.change_scheduled_at) }}
            </p>
          </div>

          <!-- Subscription Details -->
          <div class="subscription-info mt-5">
            <div class="columns is-multiline">
              <div class="column is-6">
                <div class="info-box">
                  <span class="icon has-text-info">
                    <i class="mdi mdi-calendar"></i>
                  </span>
                  <div>
                    <p class="has-text-weight-bold">Next Billing Date</p>
                    <p>{{ formatDate(subscriptionDetails?.charge_at) }}</p>
                  </div>
                </div>
              </div>
              <div class="column is-6">
                <div class="info-box">
                  <span class="icon has-text-info">
                    <i class="mdi mdi-clock-outline"></i>
                  </span>
                  <div>
                    <p class="has-text-weight-bold">Current Period</p>
                    <p>{{ formatDate(subscriptionDetails?.current_start) }} - 
                       {{ formatDate(subscriptionDetails?.current_end) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Plan Features -->
          <div class="plan-features mt-5">
            <h3 class="title is-5">Plan Features</h3>
            <div class="columns is-multiline">
              <div class="column is-6" 
                   v-for="(feature, index) in currentPlan?.features" 
                   :key="index">
                <div class="feature-item">
                  <span class="icon has-text-success">
                    <i class="mdi mdi-check-circle"></i>
                  </span>
                  <span>{{ feature }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Pay Now Button -->
          <b-button
            v-if="paymentUrl"
            class="mt-5"
            type="is-primary"
            expanded
            @click="handlePayNow">
            Pay Now
          </b-button>
        </div>
      </div>


            <!-- Modals -->
            <b-modal v-model="isModalActive" :width="640" trap-focus>
        <div class="card">
          <header class="card-header">
            <p class="card-header-title">{{ modalTitle }}</p>
          </header>
          <div class="card-content">
            <!-- Pause Modal -->
            <div v-if="modalType === 'pause'">
              <div class="content">
                <h3 class="title is-4">Pause Your Subscription</h3>
                <b-message type="is-info">
                  <ul>
                    <li>Your subscription will be paused immediately</li>
                    <li>No charges during the pause period</li>
                    <li>All data will be preserved</li>
                    <li>Resume anytime to restore access</li>
                  </ul>
                </b-message>
              </div>
            </div>

            <!-- Resume Modal -->
            <div v-if="modalType === 'resume'">
              <div class="content">
                <h3 class="title is-4">Resume Your Subscription</h3>
                <b-message type="is-success">
                  <ul>
                    <li>Your access will be restored immediately</li>
                    <li>Billing will resume from today</li>
                    <li>All your saved data is available</li>
                  </ul>
                </b-message>
              </div>
            </div>

            <!-- Update Modal -->
            <div v-if="modalType === 'update'">
              <div class="content">
                <h3 class="title is-4">Update Your Plan</h3>
                <div v-if="loadingPlans" class="has-text-centered">
                  <b-loading :is-full-page="false" active></b-loading>
                </div>
                <div v-else>
                  <div v-for="plan in availablePlans" :key="plan.id" class="plan-option mb-4">
                    <b-radio v-model="selectedPlan" :native-value="plan.id">
                      <div class="plan-details">
                        <div>
                          <strong>{{ plan.item.name }}</strong>
                          <p class="has-text-grey">₹{{ (plan.item.amount/100).toFixed(2) }}/month</p>
                        </div>
                      </div>
                    </b-radio>
                  </div>
                  <b-message type="is-info" class="mt-4">
                    <p>Note: Plan changes will take effect from the next billing cycle.</p>
                  </b-message>
                </div>
              </div>
            </div>

            <!-- Cancel Modal -->
            <div v-if="modalType === 'cancel'">
              <div class="content">
                <h3 class="title is-4">Cancel Subscription</h3>
                <b-message type="is-danger">
                  <ul>
                    <li>Your subscription will be cancelled immediately</li>
                    <li>Access will continue until the end of current billing period</li>
                    <li>All data will be preserved for 30 days</li>
                  </ul>
                </b-message>
              </div>
            </div>
          </div>
          <footer class="card-footer">
            <div class="card-footer-item">
              <div class="buttons">
                <b-button
                  @click="closeModal"
                  type="is-light">
                  Cancel
                </b-button>
                <b-button
                  @click="handleAction"
                  :type="modalType === 'cancel' ? 'is-danger' : 'is-primary'"
                  :loading="actionLoading"
                  :disabled="!isActionEnabled">
                  {{ actionButtonText }}
                </b-button>
              </div>
            </div>
          </footer>
        </div>
      </b-modal>
    </section>
  </div>
</template>

<script>
import { postAWSAPI, getPlanDetails, getAllPlans } from '@/components/api-aws'

export default {
  name: 'SubscriptionPage',
  
  data() {
    return {
      loading: true,
      error: null,
      subscriptionDetails: null,
      currentPlan: null,
      isModalActive: false,
      modalType: null,
      actionLoading: false,
      showNotification: false,
      notificationType: 'is-info',
      notificationMessage: '',
      selectedPlan: null,
      availablePlans: [],
      loadingPlans: false,
      notificationTimeout: null
    }
  },

  computed: {
    modalTitle() {
      const titles = {
        pause: 'Pause Subscription',
        resume: 'Resume Subscription',
        update: 'Update Plan',
        cancel: 'Cancel Subscription'
      }
      return titles[this.modalType] || ''
    },

    actionButtonText() {
      const texts = {
        pause: 'Pause Subscription',
        resume: 'Resume Subscription',
        update: 'Update Plan',
        cancel: 'Cancel Subscription'
      }
      return texts[this.modalType] || ''
    },

    subscriptionStatus() {
      return this.subscriptionDetails?.status || 'inactive'
    },

    getStatusType() {
      const statusTypes = {
        active: 'is-success',
        paused: 'is-warning',
        cancelled: 'is-danger',
        default: 'is-light'
      }
      return statusTypes[this.subscriptionStatus] || statusTypes.default
    },

    getStatusText() {
      const statusTexts = {
        active: 'Active',
        paused: 'Paused',
        cancelled: 'Cancelled',
        default: 'Unknown'
      }
      return statusTexts[this.subscriptionStatus] || statusTexts.default
    },

    showPauseOption() {
      return this.subscriptionStatus === 'active'
    },

    showResumeOption() {
      return this.subscriptionStatus === 'paused'
    },

    isActionEnabled() {
      if (this.modalType === 'update') {
        return !!this.selectedPlan
      }
      return true
    },

    formattedAmount() {
      return this.currentPlan?.item?.amount 
        ? `₹${(this.currentPlan.item.amount/100).toFixed(2)}/month`
        : '₹0.00/month'
    },

    isScheduledDatePassed() {
      if (!this.subscriptionDetails?.change_scheduled_at) return false
      const scheduledDate = this.subscriptionDetails.change_scheduled_at * 1000
      return new Date() > new Date(scheduledDate)
    },

    planUpdateAmountDifference() {
      if (!this.subscriptionDetails?.has_scheduled_changes || !this.currentPlan) return 0
      
      // Get the new plan amount from the scheduled changes
      const newPlanAmount = this.subscriptionDetails.scheduled_plan?.amount || 0
      const currentPlanAmount = this.currentPlan.item.amount || 0
      
      // Calculate the difference (new plan - current plan)
      return (newPlanAmount - currentPlanAmount) / 100 // Convert from paise to rupees
    },

    paymentUrl() {
      if (!this.subscriptionDetails) return null
      
      // If there's a scheduled plan update, use the update payment URL
      if (this.subscriptionDetails.has_scheduled_changes && this.planUpdateAmountDifference > 0) {
        return this.subscriptionDetails.update_payment_url
      }
      
      // Otherwise use the regular subscription payment URL
      return this.subscriptionDetails.short_url
    },

    paymentButtonText() {
      if (this.subscriptionDetails?.has_scheduled_changes && this.planUpdateAmountDifference > 0) {
        return `₹${this.planUpdateAmountDifference.toFixed(2)} for Plan Update`
      }
      return this.formattedAmount
    }
  },

  created() {
    this.fetchSubscriptionAndPlan()
  },

  beforeUnmount() {
    // Clear any pending timeouts
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout)
    }
  },

  methods: {
    async fetchSubscriptionAndPlan() {
      try {
        this.loading = true
        this.error = null

        const subscriptionResponse = await postAWSAPI({
          mode: 'get',
          subscription_id: 'sub_Q7poXsZnqltnVM' // Replace with actual subscription ID
        })

        if (subscriptionResponse.statusCode === 200) {
          this.subscriptionDetails = subscriptionResponse.body.data
          
          const planResponse = await getPlanDetails(this.subscriptionDetails.plan_id)
          
          if (planResponse.statusCode === 200) {
            this.currentPlan = planResponse.body.data
          }
        } else {
          throw new Error('Failed to fetch subscription details')
        }
      } catch (error) {
        console.error('Error fetching subscription details:', error)
        this.error = error.message || 'Failed to load subscription details. Please try again.'
        this.showNotificationMessage('is-danger', this.error)
      } finally {
        this.loading = false
      }
    },

    async handleAction() {
      if (!this.isActionEnabled) return

      try {
        this.actionLoading = true
        const actions = {
          pause: {
            mode: 'pause',
            successMessage: 'Subscription paused successfully'
          },
          resume: {
            mode: 'resume',
            successMessage: 'Subscription resumed successfully'
          },
          cancel: {
            mode: 'cancel',
            successMessage: 'Subscription cancelled successfully'
          },
          update: {
            mode: 'update',
            successMessage: 'Plan update scheduled for next billing cycle',
            additionalData: {
              plan_id: this.selectedPlan,
              current_plan_id: this.subscriptionDetails.plan_id
            }
          }
        }

        const action = actions[this.modalType]
        if (!action) return

        const response = await postAWSAPI({
          mode: action.mode,
          subscription_id: this.subscriptionDetails.id,
          ...action.additionalData
        })

        if (response.statusCode === 200) {
          if (this.modalType === 'update') {
            this.subscriptionDetails = {
              ...this.subscriptionDetails,
              has_scheduled_changes: true,
              change_scheduled_at: response.body.data.change_scheduled_at
            }
          } else {
            this.subscriptionDetails = response.body.data
          }
          this.showNotificationMessage('is-success', action.successMessage)
        }

        this.closeModal()
      } catch (error) {
        console.error('Action error:', error)
        this.showNotificationMessage('is-danger', error.message || 'An error occurred. Please try again.')
      } finally {
        this.actionLoading = false
      }
    },

    async fetchAvailablePlans() {
      try {
        this.loadingPlans = true
        const response = await getAllPlans()
        
        if (response.statusCode === 200) {
          this.availablePlans = response.body.data.items.filter(
            plan => plan.id !== this.subscriptionDetails.plan_id
          )
        }
      } catch (error) {
        console.error('Error fetching available plans:', error)
        this.showNotificationMessage('is-danger', error.message || 'Failed to load available plans')
      } finally {
        this.loadingPlans = false
      }
    },

    openModal(type) {
      this.modalType = type
      this.isModalActive = true
      this.selectedPlan = null
      
      if (type === 'update') {
        this.fetchAvailablePlans()
      }
    },

    closeModal() {
      this.isModalActive = false
      this.modalType = null
      this.selectedPlan = null
    },

    handlePayNow() {
      if (this.paymentUrl) {
        window.open(this.paymentUrl, '_blank')
      }
    },

    showNotificationMessage(type, message) {
      // Clear any existing timeout
      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout)
      }

      this.notificationType = type
      this.notificationMessage = message
      this.showNotification = true

      this.notificationTimeout = setTimeout(() => {
        this.showNotification = false
      }, 5000)
    },

    formatDate(timestamp) {
      if (!timestamp) return 'N/A'
      return new Date(timestamp * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.subscription-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px;
}

.main-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1);
}

.plan-header {
  border-bottom: 1px solid #f5f5f5;
  padding-bottom: 20px;
}

.plan-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.plan-option {
  padding: 15px;
  border: 1px solid #dbdbdb;
  border-radius: 6px;
}

.plan-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left: 8px;
}

.loading-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.error-message {
  text-align: center;
  color: #ff3860;
  padding: 20px;
}
</style>
