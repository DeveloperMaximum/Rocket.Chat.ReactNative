import { dequal } from 'dequal';
import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { themes } from '../../../constants/colors';
import { IAttachment } from '../../../definitions/IAttachment';
import { TGetCustomEmoji } from '../../../definitions/IEmoji';
import { CustomIcon } from '../../../lib/Icons';
import sharedStyles from '../../../views/Styles';
import Markdown from '../../markdown';
import MessageContext from '../Context';
import Touchable from '../Touchable';

const styles = StyleSheet.create({
	button: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 6,
		alignSelf: 'flex-start',
		borderWidth: 1,
		borderRadius: 4
	},
	attachmentContainer: {
		flex: 1,
		borderRadius: 4,
		flexDirection: 'column',
		padding: 8
	},
	authorContainer: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center'
	},
	fieldsContainer: {
		flex: 1,
		flexWrap: 'wrap',
		flexDirection: 'row'
	},
	fieldContainer: {
		flexDirection: 'column',
		padding: 10
	},
	fieldTitle: {
		fontSize: 15,
		...sharedStyles.textBold
	},
	marginTop: {
		marginTop: 4
	},
	marginBottom: {
		marginBottom: 4
	},
	title: {
		flex: 1,
		fontSize: 16,
		...sharedStyles.textMedium
	},
	touchableContainer: { flex: 1, flexDirection: 'row' },
	markdownFontSize: { fontSize: 15 },
	iconContainer: { width: 20, height: 20, right: 8, top: 6, justifyContent: 'center', alignItems: 'center' }
});

interface IMessageFields {
	attachment: IAttachment;
	theme: string;
	getCustomEmoji: TGetCustomEmoji;
}

interface IMessageReply {
	attachment: IAttachment;
	timeFormat?: string;
	index: number;
	theme: string;
	getCustomEmoji: TGetCustomEmoji;
}

const Fields = React.memo(
	({ attachment, theme, getCustomEmoji }: IMessageFields) => {
		if (!attachment.fields) {
			return null;
		}

		const { baseUrl, user } = useContext(MessageContext);
		return (
			<View style={styles.fieldsContainer}>
				{attachment.fields.map(field => (
					<View key={field.title} style={[styles.fieldContainer, { width: field.short ? '50%' : '100%' }]}>
						<Text testID='collapsibleQuoteTouchableFieldTitle' style={[styles.fieldTitle, { color: themes[theme].bodyText }]}>
							{field.title}
						</Text>
						<Markdown
							msg={field?.value || ''}
							baseUrl={baseUrl}
							username={user.username}
							getCustomEmoji={getCustomEmoji}
							theme={theme}
							style={[styles.markdownFontSize]}
						/>
					</View>
				))}
			</View>
		);
	},
	(prevProps, nextProps) =>
		dequal(prevProps.attachment.fields, nextProps.attachment.fields) && prevProps.theme === nextProps.theme
);

const CollapsibleQuote = React.memo(
	({ attachment, index, getCustomEmoji, theme }: IMessageReply) => {
		const [open, setOpen] = useState(false);
		if (!attachment) {
			return null;
		}

		const onPress = () => {
			setOpen(!open);
		};

		const {
			borderColor,
			chatComponentBackground: backgroundColor,
			collapsibleQuoteBorder,
			collapsibleChevron,
			headerTintColor
		} = themes[theme];

		return (
			<>
				<Touchable
					testID='collapsibleQuoteTouchable'
					onPress={onPress}
					style={[
						styles.button,
						index > 0 && styles.marginTop,
						attachment.description && styles.marginBottom,
						{
							backgroundColor,
							borderLeftColor: collapsibleQuoteBorder,
							borderTopColor: borderColor,
							borderRightColor: borderColor,
							borderBottomColor: borderColor,
							borderLeftWidth: 2
						}
					]}
					background={Touchable.Ripple(themes[theme].bannerBackground)}>
					<View style={styles.touchableContainer}>
						<View style={styles.attachmentContainer}>
							<View style={styles.authorContainer}>
								<Text testID='collapsibleQuoteTitle' style={[styles.title, { color: headerTintColor }]}>
									{attachment.title}
								</Text>
							</View>
							{open && <Fields attachment={attachment} getCustomEmoji={getCustomEmoji} theme={theme} />}
						</View>
						<View style={styles.iconContainer}>
							<CustomIcon name={open ? 'chevron-up' : 'chevron-down'} size={22} color={collapsibleChevron} />
						</View>
					</View>
				</Touchable>
			</>
		);
	},
	(prevProps, nextProps) => dequal(prevProps.attachment, nextProps.attachment) && prevProps.theme === nextProps.theme
);

CollapsibleQuote.displayName = 'CollapsibleQuote';
Fields.displayName = 'CollapsibleQuoteFields';

export default CollapsibleQuote;
