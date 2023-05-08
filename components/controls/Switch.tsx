import React, { useMemo } from 'react'
import ReactSwitch from 'react-switch'
import colors from 'tailwindcss/colors'

export default function Switch({
	checked,
	onChange, 
	checkedIcon, 
	uncheckedIcon,
	disabled,
} : {
	checked: boolean,
	onChange: (checked: boolean) => void,
	checkedIcon?: boolean | JSX.Element | undefined,
	uncheckedIcon?: boolean | JSX.Element | undefined,
	disabled?: boolean
}) {
	return <ReactSwitch
		borderRadius={0}
		onChange={onChange}
		checked={checked}
		offColor={colors.slate[700]} onColor={colors.red[600]}
		checkedIcon={checkedIcon || false}
		uncheckedIcon={uncheckedIcon || false}
		disabled={disabled}
	/>
}
