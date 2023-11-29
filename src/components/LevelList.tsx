import { ILevel } from '../model/level'
import styles from './LevelList.module.css'

export default function LevelList(props: {
    selected: string
    levels: ILevel[]
    onChange: (index: number) => void
}) {
    
    const selectedLevel = props.levels.findIndex((level) => level.title === props.selected)

    return (
        <>
            <div className={styles.customSelect}>
                <select
                    title="select title"
                    size={10}
                    onChange={(e) => {
                        props.onChange(Number(e.target.value))
                    }}
                    defaultValue={selectedLevel}
                >
                    {props.levels.map((level, index) => (
                        <option
                            value={index}
                            key={level.title}
                        >
                            {level.title}
                        </option>
                    ))}
                </select>
            </div>
        </>
    )
}
