const e = (el) => document.querySelector(el)

function animatedTorchEffect({ canvas, video, color, threshold }) {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)

    const locs = colorLocsUnderThreshold(canvas, data, color, threshold)

    if (locs.length > 0) {
        const center = centerOfLocs(locs)

        let rad = Math.hypot(canvas.width, canvas.height)
        rad += Math.random() * 0.1 * rad

        const grd = ctx.createRadialGradient(
            center.x,
            center.y,
            rad * 0.1,
            center.x,
            center.y,
            rad * 0.4
        )

        grd.addColorStop(0, 'rgba(0, 0, 0, 0)')
        grd.addColorStop(1, 'rgba(0, 0, 0, 0.8)')

        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(center.x, center.y, rad, 0, Math.PI * 2)
        ctx.fill()
    } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
        ctx.rect(0, 0, canvas.width, canvas.height)
        ctx.fill()
    }

    requestAnimationFrame(() =>
        animatedTorchEffect({ canvas, video, color, threshold })
    )
}

function centerOfLocs(locs) {
    const center = { x: 0, y: 0 }
    for (let i = 0; i < locs.length; i++) {
        center.x += locs[i].x
        center.y += locs[i].y
    }
    center.x /= locs.length
    center.y /= locs.length
    return center
}

function colorLocsUnderThreshold(canvas, data, color, threshold) {
    const locs = []
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i],
            g = data[i + 1],
            b = data[i + 2]
        if (distance([r, g, b], color) < threshold) {
            const x = (i / 4) % canvas.width
            const y = Math.ceil(i / 4 / canvas.width)
            locs.push({ x, y })
        }
    }
    return locs
}

function distance(p1, p2) {
    return Math.sqrt(
        (p1[0] - p2[0]) * (p1[0] - p2[0]) +
            (p1[1] - p2[1]) * (p1[1] - p2[1]) +
            (p1[2] - p2[2]) * (p1[2] - p2[2])
    )
}

function main() {
    const torchCanvas = e('#torch-canvas')
    const video = document.createElement('video')
    const color = [52, 95, 38]

    navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((rawData) => {
            video.srcObject = rawData
            video.play()
            video.onloadeddata = () =>
                animatedTorchEffect({
                    canvas: torchCanvas,
                    video,
                    color,
                    threshold: 70,
                })
        })
        .catch((err) => alert(err))
}

main()
