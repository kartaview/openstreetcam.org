import { Pipe, PipeTransform } from '@angular/core';
import { IApolloSign } from '../api-services/apollo/models'

@Pipe({ name: 'roadSignUrl' })
export class RoadSignUrlPipe implements PipeTransform {

  transform(sign: IApolloSign): string {
    if (sign.iconName && sign.iconName !== '-') {
      if (sign.iconName.indexOf('.svg') > 1 || sign.iconName.indexOf('.png') > 1) {
        return 'assets/signs/' + sign.iconName;
      } else {
        return 'assets/signs/' + sign.iconName + '.svg';
      }
    }
    if (sign.internalName === 'EXCLUSION_US_WRONG_WAY') {
      return 'assets/signs/own/EXCLUSION_US_WRONG_WAY.png';
    } else if (sign.internalName === 'ARROW_DOWN') {
      return 'assets/signs/own/ARROW_DOWN.png';
    } else if (sign.internalName === 'ARROW_AHEAD_RIGHT') {
      return 'assets/signs/own/ARROW_AHEAD_RIGHT.png';
    } else if (sign.internalName === 'ARROW_AHEAD_LEFT') {
      return 'assets/signs/own/ARROW_AHEAD_LEFT.png';
    } else if (sign.internalName === 'ARROW_RIGHT') {
      return 'assets/signs/own/ARROW_RIGHT.png';
    } else if (sign.internalName === 'ARROW_LEFT') {
      return 'assets/signs/own/ARROW_LEFT.png';
    } else if (sign.internalName === 'ARROW_STRAIGHT') {
      return 'assets/signs/own/ARROW_STRAIGHT.png';
    } else if (sign.internalName === 'ARROW_STRAIGHT_RIGHT') {
      return 'assets/signs/own/ARROW_STRAIGHT_RIGHT.png';
    } else if (sign.internalName === 'ARROW_STRAIGHT_LEFT') {
      return 'assets/signs/own/ARROW_STRAIGHT_LEFT.png';
    } else if (sign.internalName === 'ARROW_CURVED_RIGHT') {
      return 'assets/signs/own/ARROW_CURVED_RIGHT.png';
    } else if (sign.internalName === 'ARROW_CURVED_LEFT') {
      return 'assets/signs/own/ARROW_CURVED_LEFT.png';
    } else if (sign.internalName === 'ARROW_DIVERGENT_STRAIGHT_RIGHT') {
      return 'assets/signs/own/ARROW_DIVERGENT_STRAIGHT_RIGHT.png';
    } else if (sign.internalName === 'ARROW_DIVERGENT_STRAIGHT_LEFT') {
      return 'assets/signs/own/ARROW_DIVERGENT_STRAIGHT_LEFT.png';
    } else if (sign.internalName === 'ROUTE_SIGN') {
      return 'assets/signs/own/ROUTE_SIGN.png';
    } else if (sign.internalName === 'TRAFFIC_LIGHTS_SIGN') {
      return 'assets/signs/own/TRAFFIC_LIGHTS_SIGN.svg';
    } else if (sign.internalName === 'ONE_WAY_US_BEGIN') {
      return 'assets/signs/own/ONE_WAY_US_BEGIN.png';
    } else if (sign.internalName === 'ONE_WAY_US_END') {
      return 'assets/signs/own/ONE_WAY_US_END.png';
    } else if (sign.internalName === 'MANDATORY_US_STRAIGHT') {
      return 'assets/signs/own/MANDATORY_US_STRAIGHT.png';
    } else if (sign.internalName === 'MANDATORY_US_RIGHT_LANE_RIGHT') {
      return 'assets/signs/own/MANDATORY_US_RIGHT_LANE_RIGHT.png';
    }
    if (typeof sign.internalName === 'undefined') {
      return 'assets/signs/own/ic_not_supported.svg';
    }
    console.log(sign);
    console.error(`Cannot find sign ${sign.internalName} / ${sign.iconName}`)
    return 'assets/signs/invalid_' + sign.iconName + '.svg';

  }
}
