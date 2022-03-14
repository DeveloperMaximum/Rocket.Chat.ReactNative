import React, { useContext } from 'react';
import { StyleProp, TextStyle, View } from 'react-native';
import FastImage from '@rocket.chat/react-native-fast-image';
import { dequal } from 'dequal';
import { createImageProgress } from 'react-native-image-progress';
import * as Progress from 'react-native-progress';

import Touchable from './Touchable';
import Markdown from '../markdown';
import styles from './styles';
import { formatAttachmentUrl } from '../../lib/utils';
import { themes } from '../../constants/colors';
import MessageContext from './Context';
import { TGetCustomEmoji } from '../../definitions/IEmoji';

type TMessageButton = {
	children: JSX.Element;
	disabled: boolean;
	onPress: Function;
	theme: string;
};

type TMessageImage = {
	img: string;
	theme: string;
};

interface IMessageImage {
	file: { image_url: string; description?: string };
	imageUrl?: string;
	showAttachment: Function;
	style?: StyleProp<TextStyle>[];
	theme: string;
	getCustomEmoji: TGetCustomEmoji;
}

const ImageProgress = createImageProgress(FastImage);

const Button = React.memo(({ children, onPress, disabled, theme }: TMessageButton) => (
	<Touchable
		disabled={disabled}
		onPress={onPress}
		style={styles.imageContainer}
		background={Touchable.Ripple(themes[theme].bannerBackground)}>
		{children}
	</Touchable>
));

export const MessageImage = React.memo(({ img, theme }: TMessageImage) => (
	<ImageProgress
		style={[styles.image, { borderColor: themes[theme].borderColor }]}
		source={{ uri: encodeURI(img) }}
		resizeMode={FastImage.resizeMode.cover}
		indicator={Progress.Pie}
		indicatorProps={{
			color: themes[theme].actionTintColor
		}}
	/>
));

const ImageContainer = React.memo(
	({ file, imageUrl, showAttachment, getCustomEmoji, style, theme }: IMessageImage) => {
		const { baseUrl, user } = useContext(MessageContext);
		const img = imageUrl || formatAttachmentUrl(file.image_url, user.id, user.token, baseUrl);
		if (!img) {
			return null;
		}

		const onPress = () => showAttachment(file);

		if (file.description) {
			return (
				<Button disabled={!showAttachment} theme={theme} onPress={onPress}>
					<View>
						<MessageImage img={img} theme={theme} />
						<Markdown
							msg={file.description}
							style={style}
							baseUrl={baseUrl}
							username={user.username}
							getCustomEmoji={getCustomEmoji}
							theme={theme}
						/>
					</View>
				</Button>
			);
		}

		return (
			<Button disabled={!showAttachment} theme={theme} onPress={onPress}>
				<MessageImage img={img} theme={theme} />
			</Button>
		);
	},
	(prevProps, nextProps) => dequal(prevProps.file, nextProps.file) && prevProps.theme === nextProps.theme
);

ImageContainer.displayName = 'MessageImageContainer';
MessageImage.displayName = 'MessageImage';

export default ImageContainer;
