import React, { useState } from 'react';
import { PlusIcon, CheckCircledIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Dialog } from '@/components/ui/Dialog/Dialog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner/LoadingSpinner';
import styles from './AddExpertCard.module.scss';

export function AddExpertCard() {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ticker: '',
    costPerMessage: '10',
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Start loading
    setIsLoading(true);

    // Simulate expert creation with 2 second delay
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 2000);
  };

  const resetDialog = () => {
    setShowDialog(false);
    setIsSuccess(false);
    setIsLoading(false);
    setFormData({
      name: '',
      ticker: '',
      costPerMessage: '10',
    });
  };

  return (
    <>
      <div className={styles.addExpertCard} onClick={() => setShowDialog(true)}>
        <div className={styles.iconContainer}>
          <PlusIcon className={styles.plusIcon} />
        </div>
        <div className={styles.content}>
          <h4 className={styles.title}>Add your expert and earn</h4>
          <p className={styles.description}>
            Create your own AI expert and start earning from consultations
          </p>
        </div>
      </div>

      <Dialog
        open={showDialog}
        onOpenChange={resetDialog}
        title={isLoading ? 'Creating Expert...' : isSuccess ? 'Expert Created!' : 'Add New Expert'}
        description={
          isLoading
            ? 'Please wait while we create your expert'
            : isSuccess
              ? 'Your expert will be created soon and available for consultations'
              : 'Fill in the details to create your expert'
        }
      >
        {isLoading ? (
          <LoadingSpinner
            title="Creating Expert"
            subtitle="Please wait while we set up your expert..."
          />
        ) : isSuccess ? (
          <div className={styles.successContent}>
            <div className={styles.successIcon}>
              <CheckCircledIcon />
            </div>
            <p>
              Your expert <strong>{formData.name}</strong> with token{' '}
              <strong>bt{formData.ticker.toUpperCase()}</strong> will be available soon!
            </p>
            <Button onClick={resetDialog} className={styles.okButton}>
              OK
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Expert Name
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                placeholder="Enter expert name"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="ticker" className={styles.label}>
                Token Ticker
              </label>
              <div className={styles.tickerInput}>
                <span className={styles.tickerPrefix}>bt</span>
                <Input
                  id="ticker"
                  type="text"
                  value={formData.ticker}
                  onChange={e => handleInputChange('ticker', e.target.value.toUpperCase())}
                  placeholder="TICKER"
                  required
                  className={styles.tickerField}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="cost" className={styles.label}>
                Cost per Message (tokens)
              </label>
              <Input
                id="cost"
                type="number"
                value={formData.costPerMessage}
                onChange={e => handleInputChange('costPerMessage', e.target.value)}
                placeholder="10"
                min="1"
                required
              />
            </div>

            <Button
              type="submit"
              className={styles.mintButton}
              disabled={!formData.name || !formData.ticker || !formData.costPerMessage || isLoading}
            >
              {isLoading ? 'Creating...' : 'Mint'}
            </Button>
          </form>
        )}
      </Dialog>
    </>
  );
}
