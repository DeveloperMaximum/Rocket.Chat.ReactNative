import { StyleSheet } from 'react-native';

export default StyleSheet.create({
	disabled: {
		opacity: 0.3
	},
	avatarContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 10
	},
	avatarButtons: {
		flexWrap: 'wrap',
		flexDirection: 'row',
		justifyContent: 'flex-start'
	},
	avatarButton: {
		backgroundColor: '#e1e5e8',
		width: 50,
		height: 50,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 15,
		marginBottom: 15,
		borderRadius: 2
	},

	container: {
		flex: 1,
		flexDirection: 'row'
	},
	column: {
		flexDirection: 'column',
		justifyContent: 'space-between',
		lineHeight: 1
	},
	box: {
		width: 50,
		marginRight: 20
	},
	success: {
		color: 'green',
		marginTop: 20
	},
	danger: {
		color: 'red'
	}
});
