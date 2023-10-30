import * as React from 'react';
import Spinner from 'react-spinkit';
import classnames from 'classnames';
import styles from './styles.module.scss';

export enum LoaderSize {
  LARGE,
  SMALL,
  EXTRA_SMALL,
}

export interface ILoader {
  text?: string;
  style?: any;
  color?: string;
  center?: boolean;
  size?: LoaderSize;
  className?: string;
}

export default class LoadingIndicator extends React.Component<ILoader, {}> {
  public static defaultProps = {
    center: false,
    size: LoaderSize.SMALL,
  };

  public render() {
    const color = this.props.color ? this.props.color : this.props.size === LoaderSize.LARGE ? 'white' : '#0968C3';
    const spinnerStyles = {
      [styles.extraSmall]: this.props.size === LoaderSize.EXTRA_SMALL,
      [styles.small]: this.props.size === LoaderSize.SMALL,
      [styles.big]: this.props.size === LoaderSize.LARGE,
      'd-flex': true,
      'justify-content-center': true,
    };

    const parentStyles = {
      [styles.centered]: this.props.center,
    };

    return (
      <div className={classnames(parentStyles, this.props.className)} style={this.props.style || {}}>
        <Spinner color={color} fadeIn="none" className={classnames(spinnerStyles)} style={this.props.style} name="line-scale-pulse-out" />
        {this.props.text}
      </div>
    );
  }
}
