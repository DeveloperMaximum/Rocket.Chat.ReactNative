import React from 'react';
import { Picker, StyleProp, StyleSheet, Text, TextInputProps, TextStyle, View, ViewStyle } from 'react-native';

import sharedStyles from '../views/Styles';
import { themes } from '../constants/colors';
import ActivityIndicator from './ActivityIndicator';

const styles = StyleSheet.create({
	error: {
		...sharedStyles.textAlignCenter,
		paddingTop: 5
	},
	inputContainer: {
		marginBottom: 10
	},
	label: {
		marginBottom: 10,
		fontSize: 14,
		...sharedStyles.textSemibold
	},
	input: {
		...sharedStyles.textRegular,
		fontSize: 16,
		paddingLeft: 10,
		borderWidth: StyleSheet.hairlineWidth,
		borderRadius: 2
	},
	iconContainer: {
		position: 'absolute',
		top: 14
	},
	iconRight: {
		right: 15
	}
});

interface IRCPickerProps extends TextInputProps {
	label?: string;
	error?: {
		error: any;
		reason: any;
	};
	loading?: boolean;
	containerStyle?: StyleProp<ViewStyle>;
	inputStyle?: TextStyle;
	inputRef?: React.Ref<unknown>;
	testID?: string;
	iconLeft?: string;
	iconRight?: string;
	left?: JSX.Element;
	onIconRightPress?(): void;
	theme: string;
}

export default class RCPicker extends React.PureComponent<IRCPickerProps, any> {
	static defaultProps = {
		error: {},
		theme: 'light'
	};

	get loading() {
		const { theme } = this.props;
		// @ts-ignore
		return <ActivityIndicator style={[styles.iconContainer, styles.iconRight, { color: themes[theme].bodyText }]} />;
	}

	render() {
		const {
			label,
			left,
			error,
			loading,
			secureTextEntry,
			containerStyle,
			inputRef,
			iconLeft,
			iconRight,
			inputStyle,
			testID,
			placeholder,
			theme,
			...inputProps
		} = this.props;
		const { dangerColor } = themes[theme];
		return (
			<View style={[styles.inputContainer, containerStyle]}>
				{label ? (
					<Text style={[styles.label, { color: themes[theme].titleText }, error?.error && { color: dangerColor }]}>{label}</Text>
				) : null}
				<View
					style={[
						styles.input,
						{
							textAlignVertical: 'top',
							backgroundColor: themes[theme].backgroundColor,
							borderColor: themes[theme].separatorColor,
							color: themes[theme].titleText
						},
						error?.error && {
							color: dangerColor,
							borderColor: dangerColor
						},
						inputStyle
					]}>
					<Picker
						style={[
							{
								textAlignVertical: 'top',
								backgroundColor: themes[theme].backgroundColor,
								borderColor: themes[theme].separatorColor,
								color: themes[theme].titleText
							},
							error?.error && {
								color: dangerColor,
								borderColor: dangerColor
							}
						]}
						testID={testID}
						accessibilityLabel={placeholder}
						{...inputProps}
					/>
				</View>
				{error && error.reason ? <Text style={[styles.error, { color: dangerColor }]}>{error.reason}</Text> : null}
			</View>
		);
	}
}
