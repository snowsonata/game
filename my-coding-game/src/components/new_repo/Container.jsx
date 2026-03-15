function Container({ Xsize, Ysize, children }) {
    return (
        <div style={{
            width: Xsize,
            height: Ysize,
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            border: '1px solid black',
            background: 'black',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            {children}
        </div>
    )
}
export default Container