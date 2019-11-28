export class PhotosIteratorFiltersCount {
  osmComparison = {
    total: 0,
    notVerified: 0,
    sameData: 0,
    reviewed: {
      total: 0,
      mapped: 0,
      fixed: 0,
      alreadyFixed: 0,
      notFixed: 0,
    },
    unknown: 0
  };
  validation = {
    total: 0,
    notVerified: 0,
    verified: {
      total: 0,
      confirmed: 0,
      removed: 0,
      notSure: 0,
      edited: 0
    }
  };
  imagesValidation = {
    total: 0,
    notVerified: 0,
    verified: {
      total: 0,
      confirmed: 0,
      removed: 0,
      notSure: 0,
      edited: 0
    }
  };
  detectionType = {
    total: 0,
    manual: 0,
    automatic: 0
  }

  offlineCountEnabled = true;

  reset() {
    this.osmComparison.total = 0;
    this.osmComparison.notVerified = 0;
    this.osmComparison.sameData = 0;
    this.osmComparison.reviewed.total = 0;
    this.osmComparison.reviewed.mapped = 0;
    this.osmComparison.reviewed.fixed = 0;
    this.osmComparison.reviewed.alreadyFixed = 0;
    this.osmComparison.reviewed.notFixed = 0;
    this.osmComparison.unknown = 0;

    this.validation.total = 0;
    this.validation.notVerified = 0;
    this.validation.verified.total = 0;
    this.validation.verified.confirmed = 0;
    this.validation.verified.removed = 0;
    this.validation.verified.notSure = 0;
    this.validation.verified.edited = 0;

    this.detectionType.total = 0;
    this.detectionType.manual = 0;
    this.detectionType.automatic = 0;

    this.imagesValidation.total = 0;
    this.imagesValidation.notVerified = 0;
    this.imagesValidation.verified.total = 0;
    this.imagesValidation.verified.confirmed = 0;
    this.imagesValidation.verified.removed = 0;
    this.imagesValidation.verified.notSure = 0;
    this.imagesValidation.verified.edited = 0;
  }

  setOSMComparison(notVerified = 0, sameData = 0, fixed = 0, alreadyFixed = 0, notFixed = 0, unknown = 0) {
    this.osmComparison.total = notVerified + sameData + fixed + alreadyFixed + notFixed + unknown;
    this.osmComparison.notVerified = notVerified;
    this.osmComparison.sameData = sameData;
    this.osmComparison.reviewed.total = fixed + alreadyFixed + notFixed;
    this.osmComparison.reviewed.mapped = fixed + alreadyFixed;
    this.osmComparison.reviewed.fixed = fixed;
    this.osmComparison.reviewed.alreadyFixed = alreadyFixed;
    this.osmComparison.reviewed.notFixed = notFixed;
    this.osmComparison.unknown = unknown;
  }

  setValidation(total = 0, notVerified = 0, confirmed = 0, removed = 0, notSure = 0, edited = 0,
    automaticDetections = 0, manualDetections = 0) {
    this.validation.total = total;
    this.validation.notVerified = notVerified;
    this.validation.verified.total = confirmed + removed + edited;
    this.validation.verified.confirmed = confirmed;
    this.validation.verified.removed = removed;
    this.validation.verified.notSure = notSure;
    this.validation.verified.edited = edited;

    this.detectionType.total = automaticDetections + manualDetections;
    this.detectionType.manual = manualDetections;
    this.detectionType.automatic = automaticDetections;
  }

  incrementValidationConfirmed() {
    if (!this.offlineCountEnabled) {
      return;
    }

    this.validation.total++;
    this.validation.verified.total++;
    this.validation.verified.confirmed++;
  }

  incrementValidationRemoved() {
    if (!this.offlineCountEnabled) {
      return;
    }

    this.validation.total++;
    this.validation.verified.total++;
    this.validation.verified.removed++;
  }

  incrementValidationNotSure() {
    if (!this.offlineCountEnabled) {
      return;
    }

    this.validation.total++;
    this.validation.verified.total++;
    this.validation.verified.notSure++;
  }

  incrementValidationChanged() {
    if (!this.offlineCountEnabled) {
      return;
    }

    this.validation.total++;
    this.validation.verified.total++;
    this.validation.verified.edited++;
  }

  incrementValidationToBeChecked() {
    if (!this.offlineCountEnabled) {
      return;
    }

    this.validation.total++;
    this.validation.notVerified++;
  }

  incrementOSMNeedReview() {
    if (!this.offlineCountEnabled) {
      return;
    }

    this.osmComparison.total++;
    this.osmComparison.notVerified++;
  }

  incrementOSMSameData() {
    if (!this.offlineCountEnabled) {
      return;
    }

    this.osmComparison.total++;
    this.osmComparison.sameData++;
  }

  incrementOSMFixed() {
    if (!this.offlineCountEnabled) {
      return;
    }

    this.osmComparison.total++;
    this.osmComparison.reviewed.total++;
    this.osmComparison.reviewed.mapped++;
    this.osmComparison.reviewed.fixed++;
  }

  incrementOSMAlreadyFixed() {
    if (!this.offlineCountEnabled) {
      return;
    }

    this.osmComparison.total++;
    this.osmComparison.reviewed.total++;
    this.osmComparison.reviewed.mapped++;
    this.osmComparison.reviewed.alreadyFixed++;
  }

  incrementOSMNotFixed() {
    if (!this.offlineCountEnabled) {
      return;
    }

    this.osmComparison.total++;
    this.osmComparison.reviewed.total++;
    this.osmComparison.reviewed.notFixed++;
  }

  incrementOSMUnknown() {
    if (!this.offlineCountEnabled) {
      return;
    }

    this.osmComparison.total++;
    this.osmComparison.unknown++;
  }

  incrementDetectionTypeManual() {
    if (!this.offlineCountEnabled) {
      return;
    }

    this.detectionType.total++;
    this.detectionType.manual++;
  }

  incrementDetectionTypeAutomatic() {
    if (!this.offlineCountEnabled) {
      return;
    }

    this.detectionType.total++;
    this.detectionType.automatic++;
  }

  incrementImagesValidationConfirmed() {
    if (!this.offlineCountEnabled) {
      return;
    }

    this.imagesValidation.total++;
    this.imagesValidation.verified.total++;
    this.imagesValidation.verified.confirmed++;
  }

  incrementImagesValidationRemoved() {
    if (!this.offlineCountEnabled) {
      return;
    }

    this.imagesValidation.total++;
    this.imagesValidation.verified.total++;
    this.imagesValidation.verified.removed++;
  }

  incrementImagesValidationNotSure() {
    if (!this.offlineCountEnabled) {
      return;
    }

    this.imagesValidation.total++;
    this.imagesValidation.verified.total++;
    this.imagesValidation.verified.notSure++;
  }

  incrementImagesValidationChanged() {
    if (!this.offlineCountEnabled) {
      return;
    }

    this.imagesValidation.total++;
    this.imagesValidation.verified.total++;
    this.imagesValidation.verified.edited++;
  }

  incrementImagesValidationToBeChecked() {
    if (!this.offlineCountEnabled) {
      return;
    }

    this.imagesValidation.total++;
    this.imagesValidation.notVerified++;
  }


}
