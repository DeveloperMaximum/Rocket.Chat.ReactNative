import React from 'react';
import { ScrollView, Picker, View, Text, TouchableOpacity, Image } from 'react-native';
import PropTypes from 'prop-types';
import { connect, useSelector } from 'react-redux';
import { dequal } from 'dequal';
import omit from 'lodash/omit';

import DocumentPicker from 'react-native-document-picker';
import I18n from '../../i18n';
import Button from '../../containers/Button';
import * as HeaderButton from '../../containers/HeaderButton';
import { withTheme } from '../../theme';
import { getUserSelector } from '../../selectors/login';
import SafeAreaView from '../../containers/SafeAreaView';
import KeyboardView from '../../presentation/KeyboardView';
import sharedStyles from '../Styles';
import RCTextInput from '../../containers/TextInput';
import RCPicker from '../../containers/Picker';
import scrollPersistTaps from '../../utils/scrollPersistTaps';
import { themes } from '../../constants/colors';
import EventEmitter from '../../utils/events';
import { LISTENER } from '../../containers/Toast';
import Touch from '../../utils/touch';
import { CustomIcon } from '../../lib/Icons';
import UserPreferences from '../../lib/userPreferences';
import RocketChat from '../../lib/rocketchat';
import styles from './styles';

class SupportView extends React.Component {
	static navigationOptions = ({ navigation, isMasterDetail }) => {
		const options = {
			title: I18n.t('Support')
		};
		if (!isMasterDetail) {
			options.headerLeft = () => <HeaderButton.Drawer navigation={navigation} />;
		}
		return options;
	};

	static propTypes = {
		user: PropTypes.object,
		theme: PropTypes.string,
		baseUrl: PropTypes.string
	};

	state = {
		user: null,
		name: null,
		email: null,
		username: null,
		uf_token: null,

		TITLE: null,
		MESSAGE: null,
		CATEGORY_ID: null,
		CURRENT_USER_LOGIN: null,
		FILES: [],

		notice: false,
		formLoading: false,
		disabled: false,
		categories: [],
		defaultInput: ''
	};

	componentDidMount = async () => {
		this.init();
		const pref = await RocketChat.getUserPreferences(this.props.user.id).then(r => r);
		await this.setState({ uf_token: pref.preferences.uf_token });
		await fetch(`https://maximumportal.mxmit.ru/data/api/rc/techcats/?uf_token=${pref.preferences.uf_token}`, {
			method: 'GET'
		})
			.then(r => r.json())
			.then(r => {
				const categories = r.data !== false ? r.data : [];
				this.setState({ categories });
			})
			.catch(error => {
				console.log(JSON.stringify(error));
			});
	};

	UNSAFE_componentWillReceiveProps(nextProps) {
		const { user } = this.props;
		if (!dequal(omit(user, ['status']), omit(nextProps.user, ['status']))) {
			this.init(nextProps.user);
		}
	}

	constructor(props) {
		super(props);
		this.state = {
			user: null,
			name: null,
			email: null,
			username: null,
			uf_token: null,

			TITLE: null,
			MESSAGE: null,
			CATEGORY_ID: null,
			CURRENT_USER_LOGIN: null,
			FILES: [],

			notice: false,
			formLoading: false,
			disabled: false,
			categories: [],
			defaultInput: ''
		};
	}

	toggleNotice() {
		this.setState({
			notice: !this.state.notice
		});
	}

	renderNotice() {
		if (this.state.notice) {
			return (
				<Touch onPress={this.toggleNotice()}>
					<View>
						<Text>Cancel</Text>
					</View>
				</Touch>
			);
		}
	}

	init = user => {
		const { user: userProps } = this.props;
		const { name, username, emails } = user || userProps;

		this.setState({
			name,
			username,
			email: emails ? emails[0].address : null
		});
	};

	onSelectFile = async () => {
		try {
			const results = await DocumentPicker.pickMultiple({
				type: [DocumentPicker.types.allFiles]
			});
			for (const res of results) {
				console.info(`File Name : ${res.name}`);
			}
			this.setState({ FILES: results });
		} catch (err) {
			if (DocumentPicker.isCancel(err)) {
				alert('Canceled from multiple doc picker');
			} else {
				alert(`Unknown Error: ${JSON.stringify(err)}`);
				throw err;
			}
		}
	};

	// eslint-disable-next-line require-await
	submit = () => {
		this.setState({ formLoading: true });

		const { TITLE, MESSAGE, CATEGORY_ID, FILES, defaultInput } = this.state;

		if (!TITLE || !MESSAGE || !CATEGORY_ID) {
			EventEmitter.emit(LISTENER, { message: `Все поля обязательны для заполнения` });
			this.setState({ formLoading: false });
			return false;
		}

		const body = new FormData();

		body.append('TITLE', TITLE);
		body.append('MESSAGE', MESSAGE);
		body.append('CATEGORY_ID', CATEGORY_ID);

		const arFiles = [];
		for (const file of FILES) {
			body.append('FILES[]', file);
		}

		body.append('uf_token', this.state?.uf_token);

		fetch('https://maximumportal.mxmit.ru/data/api/ticket', {
			method: 'POST',
			body
		})
			.then(response => response.json())
			.then(responseJson => {
				const TICKET_ID = responseJson.data?.TICKET_ID ? responseJson.data.TICKET_ID : false;
				EventEmitter.emit(LISTENER, { message: 'Заявка успешно отправлена' });
				if (TICKET_ID !== false) {
					this.setState({
						notice: `Ваша заявка успешно отправлена, ей присвоен номер #${TICKET_ID}. Сотрудник технической поддержки свяжется с Вами в ближайшее время.`
					});
				} else {
					this.setState({ notice: 'По неизвестной причине заявку отправить не удалось, пожалуйста, попробуйте позже' });
				}
				this.init();
			})
			.catch(error => {
				alert(error);
			});

		this.setState({
			FILES: [],
			TITLE: defaultInput,
			MESSAGE: defaultInput,
			CATEGORY_ID: defaultInput
		});

		// this.setState({ disabled: true });

		EventEmitter.emit(LISTENER, { message: 'Заявка успешно отправлена' });
	};

	render() {
		const { theme } = this.props;

		const { disabled, formLoading, FILES } = this.state;

		return (
			<KeyboardView
				style={{ backgroundColor: themes[theme].auxiliaryBackground }}
				contentContainerStyle={sharedStyles.container}
				keyboardVerticalOffset={128}
				scrollEnabled>
				<SafeAreaView testID='support-view'>
					<ScrollView contentContainerStyle={sharedStyles.containerScrollView} testID='profile-view-list' {...scrollPersistTaps}>
						{
							<RCPicker
								label={'Категория заявки'}
								theme={theme}
								selectedValue={this.state.CATEGORY_ID}
								onValueChange={(itemValue, itemIndex) => this.setState({ CATEGORY_ID: itemValue })}>
								<Picker.Item label={'Выберите категорию обращения'} value={'0'} key={'0'} />
								{this.state.categories.map((item, key) => (
									<Picker.Item label={item.NAME} value={item.ID} key={key} />
								))}
							</RCPicker>
						}

						<RCTextInput
							onChangeText={TITLE => this.setState({ TITLE })}
							theme={theme}
							label={'Тема заявки'}
							placeholder={'Тема заявки'}
							value={this.state.TITLE}
						/>
						<RCTextInput
							onChangeText={MESSAGE => this.setState({ MESSAGE })}
							theme={theme}
							label={'Текст заявки'}
							placeholder={'Текст заявки'}
							multiline={true}
							value={this.state.MESSAGE}
							numberOfLines={5}
						/>

						<View style={styles.container}>
							<View style={styles.box}>
								<Touch
									onPress={this.onSelectFile}
									style={[styles.avatarButton, { backgroundColor: themes[theme].borderColor }]}
									enabled={true}
									theme={theme}>
									<Text style={styles.avatarButtons}>
										<CustomIcon name='link' size={30} color={themes[theme].bodyText} />
									</Text>
								</Touch>
							</View>
							<View style={styles.column}>
								<ScrollView>
									<View>
										<Text style={{ lineHeight: 45, color: themes[theme].bodyText }} theme={theme}>
											{`К заявке приложено ${FILES.length} файла (ов)`}
										</Text>
									</View>
								</ScrollView>
							</View>
						</View>
						{this.state.notice ? (
							<Text
								onPress={notice => this.setState({ notice: false })}
								style={{ color: themes[theme].successColor, marginTop: 20 }}>
								{this.state.notice}
							</Text>
						) : (
							<Button
								loading={formLoading}
								disabled={disabled}
								theme={theme}
								title='Отправить заявку'
								type='primary'
								testID='support-view-submit'
								onPress={() => {
									this.submit();
								}}
							/>
						)}
					</ScrollView>
				</SafeAreaView>
			</KeyboardView>
		);
	}
}

const mapStateToProps = state => ({
	user: getUserSelector(state),
	baseUrl: state.server.server
});

export default connect(mapStateToProps)(withTheme(SupportView));
