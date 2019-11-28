import { IApolloDetection } from './api-services/apollo/models';

export class PhotosIteratorFilters {

  private validValidationStatuses = ['CONFIRMED', 'REMOVED', 'TO_BE_REVIEWED_LATER', 'CHANGED', 'TO_BE_CHECKED'];
  private validOSMComparisons = ['SAME', 'NEW', 'CHANGED', 'UNKNOWN'];
  private validEditStatuses = ['OPEN', 'FIXED', 'ALREADY_FIXED', 'BAD_SIGN', 'OTHER'];
  private validModeStatuses = ['AUTOMATIC', 'MANUAL'];

  public validationFiltersEnabled = false;
  private validationStatuses = [];
  private validationStatusesCache = '';
  public OSMComparisonFiltersEnabled = false;
  private OSMComparisons = [];
  private OSMComparisonsCache = '';
  private editStatuses = [];
  private editStatusesCache = '';

  private detectionTypes = [];

  allPhotoDetections = false;

  signSelectionArray = [];
  signSelection = {};
  signViewRegion = null;

  osmComparison = {
    notVerified: false,
    sameData: false,
    reviewed: {
      mapped: false,
      fixed: false,
      alreadyFixed: false,
      notFixed: false,
    },
    unknown: false
  };

  validation = {
    notVerified: false,
    verified: {
      confirmed: false,
      removed: false,
      notSure: false,
      edited: false
    }
  };

  detectionType = {
    manual: false,
    automatic: false
  };

  imagesValidation = {
    notVerified: false,
    verified: {
      confirmed: false,
      removed: false,
      notSure: false,
      edited: false
    }
  };


  rebuildCallback = null;

  constructor(rebuildCallback) {
    this.rebuildCallback = rebuildCallback;
  }

  reset() {
    this.osmComparison.notVerified = false;
    this.osmComparison.sameData = false;
    this.osmComparison.reviewed.mapped = false;
    this.osmComparison.reviewed.fixed = false;
    this.osmComparison.reviewed.alreadyFixed = false;
    this.osmComparison.reviewed.notFixed = false;
    this.osmComparison.unknown = false;

    this.validation.notVerified = false;
    this.validation.verified.confirmed = false;
    this.validation.verified.removed = false;
    this.validation.verified.notSure = false;
    this.validation.verified.edited = false;

    this.detectionType.automatic = false;
    this.detectionType.manual = false;

    this.imagesValidation.notVerified = false;
    this.imagesValidation.verified.confirmed = false;
    this.imagesValidation.verified.removed = false;
    this.imagesValidation.verified.notSure = false;
    this.imagesValidation.verified.edited = false;


    this.validationStatuses = [];
    this.OSMComparisons = [];
    this.editStatuses = [];
    this.generateValidationStatusCache();
    this.generateOSMComparisonCache();
    this.generateEditStatusCache();
  }

  protected hasValidationStatus(status) {
    return this.validationStatuses.indexOf(status) > -1
  }

  protected addValidationStatus(status) {
    if (this.validValidationStatuses.indexOf(status) > -1) {
      if (!this.hasValidationStatus(status)) {
        this.validationStatuses.push(status);
        this.generateValidationStatusCache();
      }
    }
  }

  protected addValidationStatuses(statuses) {
    let found = false;
    statuses.forEach(status => {
      if (this.validValidationStatuses.indexOf(status) > -1) {
        if (!this.hasValidationStatus(status)) {
          this.validationStatuses.push(status);
          found = true;
        }
      }
    });
    if (found) {
      this.generateValidationStatusCache();
    }
  }

  protected removeValidationStatus(status) {
    if (this.validValidationStatuses.indexOf(status) > -1) {
      const index = this.validationStatuses.indexOf(status);
      if (index > -1) {
        this.validationStatuses.splice(index, 1);
        this.generateValidationStatusCache();
      }
    }
  }

  protected removeValidationStatuses(statuses) {
    let found = false;
    statuses.forEach(status => {
      if (this.validValidationStatuses.indexOf(status) > -1) {
        const index = this.validationStatuses.indexOf(status);
        if (index > -1) {
          this.validationStatuses.splice(index, 1);
          found = true;
        }
      }
    })
    if (found) {
      this.generateValidationStatusCache();
    }
  }

  public getValidationStatuses() {
    return this.validationStatuses;
  }

  protected generateValidationStatusCache() {
    this.validationStatusesCache = this.validationStatuses.join(',');
    console.log('Validation Status: ' + this.validationStatusesCache);
  }

  protected hasOSMComparison(status) {
    return this.OSMComparisons.indexOf(status) > -1;
  }

  protected addOSMComparison(status) {
    if (this.validOSMComparisons.indexOf(status) > -1) {
      if (!this.hasOSMComparison(status)) {
        this.OSMComparisons.push(status);
        this.generateOSMComparisonCache();
      }
    }
  }

  protected addOSMComparisons(statuses) {
    let found = false;
    statuses.forEach(status => {
      if (this.validOSMComparisons.indexOf(status) > -1) {
        if (!this.hasOSMComparison(status)) {
          this.OSMComparisons.push(status);
          found = true;
        }
      }
    });
    if (found) {
      this.generateOSMComparisonCache();
    }
  }

  protected removeOSMComparison(status) {
    if (this.validOSMComparisons.indexOf(status) > -1) {
      const index = this.OSMComparisons.indexOf(status);
      if (index > -1) {
        this.OSMComparisons.splice(index, 1);
        this.generateOSMComparisonCache();
      }
    }
  }

  protected removeOSMComparisons(statuses) {
    let found = false;
    statuses.forEach(status => {
      if (this.validOSMComparisons.indexOf(status) > -1) {
        const index = this.OSMComparisons.indexOf(status);
        if (index > -1) {
          this.OSMComparisons.splice(index, 1);
          found = true;
        }
      }
    })
    if (found) {
      this.generateOSMComparisonCache();
    }
  }

  public getOSMComparison() {
    return this.OSMComparisons;
  }

  protected generateOSMComparisonCache() {
    this.OSMComparisonsCache = this.OSMComparisons.join(',');
    console.log('OSM Status: ' + this.OSMComparisonsCache);
  }

  protected hasEditStatus(status) {
    return this.editStatuses.indexOf(status) > -1;
  }

  protected addEditStatus(status) {
    if (this.validEditStatuses.indexOf(status) > -1) {
      if (!this.hasEditStatus(status)) {
        this.editStatuses.push(status);
        this.generateEditStatusCache();
      }
    }
  }

  protected addEditStatuses(statuses) {
    let found = false;
    statuses.forEach(status => {
      if (this.validEditStatuses.indexOf(status) > -1) {
        if (!this.hasEditStatus(status)) {
          this.editStatuses.push(status);
          found = true;
        }
      }
    });
    if (found) {
      this.generateEditStatusCache();
    }
  }

  protected removeEditStatus(status) {
    if (this.validEditStatuses.indexOf(status) > -1) {
      const index = this.editStatuses.indexOf(status);
      if (index > -1) {
        this.editStatuses.splice(index, 1);
        this.generateEditStatusCache();
      }
    }
  }

  protected removeEditStatuses(statuses) {
    let found = false;
    statuses.forEach(status => {
      if (this.validEditStatuses.indexOf(status) > -1) {
        const index = this.editStatuses.indexOf(status);
        if (index > -1) {
          this.editStatuses.splice(index, 1);
          found = true;
        }
      }
    })
    if (found) {
      this.generateEditStatusCache();
    }
  }

  public getEditStatuses() {
    return this.editStatuses;
  }

  protected generateEditStatusCache() {
    this.editStatusesCache = this.editStatuses.join(',');
    console.log('Edit Status: ' + this.editStatusesCache);
  }

  public getDetectionTypes() {
    return this.detectionTypes;
  }


  public detectionFiltered(detection: IApolloDetection): boolean {
    const hasDetectionTypeFilter = this.detectionType.automatic || this.detectionType.manual;
    let detectionTypeFilterValid = false;
    const hasValidationFilter = this.validationStatuses.length > 0;
    let validationFilterValid = false;
    const hasOSMFilter = this.editStatuses.length > 0 || this.OSMComparisons.length > 0;
    let OSMFilterValid = false;

    if (hasDetectionTypeFilter) {
      if (this.validationFiltersEnabled) {
        if (this.detectionType.manual && detection.mode === 'MANUAL') {
          detectionTypeFilterValid = true;
        } else if (this.detectionType.automatic && detection.mode === 'AUTOMATIC') {
          detectionTypeFilterValid = true;
        }
      } else {
        detectionTypeFilterValid = true;
      }
    }
    if (this.validationStatuses.length === 0 && this.editStatuses.length === 0 &&
      this.OSMComparisons.length === 0 && !hasDetectionTypeFilter
    ) {
      return true;
    } else {
      if (this.validationFiltersEnabled) {
        if (
          this.validationStatuses.length > 0 &&
          this.validationStatuses.indexOf(detection.validationStatus) > -1
        ) {
          validationFilterValid = true;
        }
      } else {
        validationFilterValid = true;
      }
      if (this.OSMComparisonFiltersEnabled) {
        if (this.editStatuses.length > 0 && this.editStatuses.indexOf(detection.editStatus) > -1) {
          if (detection.editStatus === 'OPEN') {
            if (
              (detection.osmComparison === 'NEW' && this.OSMComparisons.indexOf('NEW') > -1) ||
              (detection.osmComparison === 'UNKNOWN' && this.OSMComparisons.indexOf('UNKNOWN') > -1) ||
              (detection.osmComparison === 'CHANGED' && this.OSMComparisons.indexOf('CHANGED') > -1)
            ) {
              OSMFilterValid = true;
            }
          } else {
            OSMFilterValid = true;
          }
        } else {
          if (this.OSMComparisons.length > 0 && this.OSMComparisons.indexOf(detection.osmComparison) > -1) {
            if (detection.osmComparison === 'NEW' || detection.osmComparison === 'CHANGED' || detection.osmComparison === 'UNKNOWN') {
              if (detection.editStatus === 'OPEN' && this.editStatuses.indexOf('OPEN')) {
                OSMFilterValid = true;
              }
            } else {
              OSMFilterValid = true;
            }
          }
        }
      } else {
        OSMFilterValid = true;
      }
      return (
        (!hasValidationFilter || (hasValidationFilter && validationFilterValid)) &&
        (!hasOSMFilter || (hasOSMFilter && OSMFilterValid)) &&
        (!hasDetectionTypeFilter || (hasDetectionTypeFilter && detectionTypeFilterValid))
      );
    }
    // return false;
  }

  public switchOSMComparison(status) {
    if (status === 'not-verified') {
      if (this.osmComparison.notVerified) {
        this.removeEditStatus('OPEN');
        this.removeOSMComparisons(['NEW', 'CHANGED']);
        this.osmComparison.notVerified = false;
        this.rebuildCallback();
      } else {
        this.addEditStatus('OPEN');
        this.addOSMComparisons(['NEW', 'CHANGED']);
        this.osmComparison.notVerified = true;
        this.rebuildCallback();
      }
    } else if (status === 'same-data') {
      if (this.osmComparison.sameData) {
        this.removeOSMComparison('SAME');
        this.osmComparison.sameData = false;
        this.rebuildCallback();
      } else {
        this.addOSMComparison('SAME');
        this.osmComparison.sameData = true;
        this.rebuildCallback();
      }
    } else if (status === 'reviewed') {
      if (this.osmComparison.reviewed.fixed || this.osmComparison.reviewed.alreadyFixed || this.osmComparison.reviewed.notFixed) {
        this.removeEditStatuses(['BAD_SIGN', 'OTHER', 'FIXED', 'ALREADY_FIXED']);
        this.osmComparison.reviewed.fixed = false;
        this.osmComparison.reviewed.alreadyFixed = false;
        this.osmComparison.reviewed.notFixed = false;
        this.rebuildCallback();
      } else {
        this.addEditStatuses(['BAD_SIGN', 'OTHER', 'FIXED', 'ALREADY_FIXED']);
        this.osmComparison.reviewed.fixed = true;
        this.osmComparison.reviewed.alreadyFixed = true;
        this.osmComparison.reviewed.notFixed = true;
        this.rebuildCallback();
      }
    } else if (status === 'mapped') {
      if (this.osmComparison.reviewed.mapped) {
        this.removeEditStatus('FIXED');
        this.removeEditStatus('ALREADY_FIXED');
        this.osmComparison.reviewed.fixed = false;
        this.osmComparison.reviewed.alreadyFixed = false;
        this.osmComparison.reviewed.mapped = false;
        this.rebuildCallback();
      } else {
        this.addEditStatus('FIXED');
        this.addEditStatus('ALREADY_FIXED');
        this.osmComparison.reviewed.fixed = true;
        this.osmComparison.reviewed.alreadyFixed = true;
        this.osmComparison.reviewed.mapped = true;
        this.rebuildCallback();
      }
    } else if (status === 'fixed') {
      if (this.osmComparison.reviewed.fixed) {
        this.removeEditStatus('FIXED');
        this.osmComparison.reviewed.fixed = false;
        this.rebuildCallback();
      } else {
        this.addEditStatus('FIXED');
        this.osmComparison.reviewed.fixed = true;
        this.rebuildCallback();
      }
    } else if (status === 'already-fixed') {
      if (this.osmComparison.reviewed.alreadyFixed) {
        this.removeEditStatus('ALREADY_FIXED');
        this.osmComparison.reviewed.alreadyFixed = false;
        this.rebuildCallback();
      } else {
        this.addEditStatus('ALREADY_FIXED');
        this.osmComparison.reviewed.alreadyFixed = true;
        this.rebuildCallback();
      }
    } else if (status === 'not-fixed') {
      if (this.osmComparison.reviewed.notFixed) {
        this.removeEditStatuses(['BAD_SIGN', 'OTHER']);
        this.osmComparison.reviewed.notFixed = false;
        this.rebuildCallback();
      } else {
        this.addEditStatuses(['BAD_SIGN', 'OTHER']);
        this.osmComparison.reviewed.notFixed = true;
        this.rebuildCallback();
      }
    } else if (status === 'unknown') {
      if (this.osmComparison.unknown) {
        this.removeOSMComparison('UNKNOWN');
        this.osmComparison.unknown = false;
        this.rebuildCallback();
      } else {
        this.addOSMComparison('UNKNOWN');
        this.osmComparison.unknown = true;
        this.rebuildCallback();
      }
    }
  }

  public switchValidationStatus(status) {
    if (status === 'not-verified') {
      if (this.validation.notVerified) {
        this.removeValidationStatuses(['TO_BE_CHECKED']);
        // this.removeModeStatus('AUTOMATIC');
        this.validation.notVerified = false;
        this.rebuildCallback();
      } else {
        this.addValidationStatuses(['TO_BE_CHECKED']);
        // this.addModeStatus('AUTOMATIC');
        this.validation.notVerified = true;
        this.rebuildCallback();
      }
    } else if (status === 'verified') {
      if (this.hasValidationStatus('CONFIRMED') || this.hasValidationStatus('REMOVED') ||
        this.hasValidationStatus('TO_BE_REVIEWED_LATER') || this.hasValidationStatus('CHANGED')) {
        this.removeValidationStatuses(['CONFIRMED', 'REMOVED', 'TO_BE_REVIEWED_LATER', 'CHANGED']);
        this.validation.verified.confirmed = false;
        this.validation.verified.removed = false;
        this.validation.verified.notSure = false;
        this.validation.verified.edited = false;
        this.rebuildCallback();
      } else {
        this.addValidationStatuses(['CONFIRMED', 'REMOVED', 'TO_BE_REVIEWED_LATER', 'CHANGED']);
        this.validation.verified.confirmed = true;
        this.validation.verified.removed = true;
        this.validation.verified.notSure = true;
        this.validation.verified.edited = true;
        this.rebuildCallback();
      }
    } else if (status === 'confirmed') {
      if (this.hasValidationStatus('CONFIRMED')) {
        this.removeValidationStatus('CONFIRMED');
        this.validation.verified.confirmed = false;
        this.rebuildCallback();
      } else {
        this.addValidationStatus('CONFIRMED');
        this.validation.verified.confirmed = true;
        this.rebuildCallback();
      }
    } else if (status === 'removed') {
      if (this.hasValidationStatus('REMOVED')) {
        this.removeValidationStatus('REMOVED');
        this.validation.verified.removed = false;
        this.rebuildCallback();
      } else {
        this.addValidationStatus('REMOVED');
        this.validation.verified.removed = true;
        this.rebuildCallback();
      }
    } else if (status === 'notSure') {
      if (this.hasValidationStatus('TO_BE_REVIEWED_LATER')) {
        this.removeValidationStatus('TO_BE_REVIEWED_LATER');
        this.validation.verified.notSure = false;
        this.rebuildCallback();
      } else {
        this.addValidationStatus('TO_BE_REVIEWED_LATER');
        this.validation.verified.notSure = true;
        this.rebuildCallback();
      }
    } else if (status === 'edited') {
      if (this.hasValidationStatus('CHANGED')) {
        this.removeValidationStatus('CHANGED');
        this.validation.verified.edited = false;
        this.rebuildCallback();
      } else {
        this.addValidationStatus('CHANGED');
        this.validation.verified.edited = true;
        this.rebuildCallback();
      }
    }
  }

  public switchDetectionType(status) {
    if (status === 'manual') {
      if (this.detectionType.manual) {
        // this.removeModeStatus('MANUAL');
        this.detectionTypes = [];
        this.detectionType.manual = false;
      } else {
        // this.addModeStatus('MANUAL');
        this.detectionTypes = ['MANUAL'];
        this.detectionType.manual = true;
      }
    } else if (status === 'automatic') {
      if (this.detectionType.automatic) {
        // this.removeModeStatus('AUTOMATIC');
        this.detectionTypes = [];
        this.detectionType.automatic = false;
      } else {
        // this.addModeStatus('AUTOMATIC');
        this.detectionTypes = ['AUTOMATIC'];
        this.detectionType.automatic = true;
      }
    }
    this.rebuildCallback();
  }

  public switchSignSelection(result) {
    this.signSelection = result.objectData;
    this.signSelectionArray = result.arrayData;
    // this.allPhotoDetections = result.allPhotoDetections;
    this.rebuildCallback();
  }

  public switchAllPhotoDetections(value) {
    if (value !== this.allPhotoDetections) {
      this.allPhotoDetections = value;
      this.rebuildCallback();
    }
  }

  public switchImagesValidationStatus(status) {
  }

  public setSignViewRegion(region) {
    if (this.signViewRegion !== region) {
      this.signViewRegion = region;
    }
  }
}
