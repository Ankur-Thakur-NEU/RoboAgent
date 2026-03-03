import * as THREE from 'three'

const makeBean = () => {
  const geometry = new THREE.SphereGeometry(0.22, 24, 24)
  geometry.scale(1.25, 0.8, 0.7)
  const material = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.4,
    metalness: 0.2,
    emissive: new THREE.Color(0x331a08),
  })
  return new THREE.Mesh(geometry, material)
}

const createGlowLine = () => {
  const points = []
  for (let i = 0; i < 60; i += 1) {
    points.push(new THREE.Vector3(i * 0.05 - 1.5, Math.sin(i * 0.2) * 0.2, 0))
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({ color: 0xffd700 })
  return new THREE.Line(geometry, material)
}

const createStreamPoints = (count, width, height) => {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3
    positions[i3] = (Math.random() - 0.5) * width
    positions[i3 + 1] = (Math.random() - 0.5) * height
    positions[i3 + 2] = (Math.random() - 0.5) * 0.6
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({
    color: 0xffd700,
    size: 0.04,
    transparent: true,
    opacity: 0.7,
  })
  return new THREE.Points(geometry, material)
}

export const createSectionAccents = (scene) => {
  const groups = {
    business: new THREE.Group(),
    revenue: new THREE.Group(),
    advantages: new THREE.Group(),
    growth: new THREE.Group(),
    market: new THREE.Group(),
    investment: new THREE.Group(),
    team: new THREE.Group(),
  }

  for (let i = 0; i < 5; i += 1) {
    const bean = makeBean()
    bean.position.set(Math.sin(i) * 0.8, Math.cos(i * 0.8) * 0.5, -0.4)
    groups.business.add(bean)
  }
  groups.business.position.set(1.6, 0.4, -1.0)

  const revenueLine = createGlowLine()
  groups.revenue.add(revenueLine)
  const revenueLine2 = createGlowLine()
  revenueLine2.position.y = -0.3
  groups.revenue.add(revenueLine2)
  const revenueStream = createStreamPoints(320, 2.6, 1.2)
  revenueStream.position.set(0, 0.1, -0.2)
  groups.revenue.add(revenueStream)
  groups.revenue.position.set(-1.8, -0.2, -1.2)

  const advantageRings = []
  for (let i = 0; i < 3; i += 1) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.5 + i * 0.2, 0.03, 16, 64),
      new THREE.MeshStandardMaterial({ color: 0x9ef1ff, emissive: 0x1c4a5b })
    )
    ring.rotation.x = Math.PI / 2
    advantageRings.push(ring)
    groups.advantages.add(ring)
  }
  groups.advantages.position.set(0, 0.6, -1.2)

  const growthMaterial = new THREE.PointsMaterial({
    color: 0xffc38f,
    size: 0.06,
    transparent: true,
    opacity: 0.8,
  })
  const growthPoints = new THREE.Points(new THREE.BufferGeometry(), growthMaterial)
  const growthCount = 400
  const growthPositions = new Float32Array(growthCount * 3)
  for (let i = 0; i < growthCount; i += 1) {
    const i3 = i * 3
    growthPositions[i3] = (Math.random() - 0.5) * 2.2
    growthPositions[i3 + 1] = Math.random() * 1.8
    growthPositions[i3 + 2] = (Math.random() - 0.5) * 1.2
  }
  growthPoints.geometry.setAttribute('position', new THREE.BufferAttribute(growthPositions, 3))
  groups.growth.add(growthPoints)

  const growthPhases = []
  const phaseColors = [0xffd700, 0xffc38f, 0x9ef1ff]
  for (let i = 0; i < 3; i += 1) {
    const phase = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.12, 0.45),
      new THREE.MeshStandardMaterial({ color: phaseColors[i], emissive: 0x2b1a10 })
    )
    phase.position.set(-0.4 + i * 0.6, -0.2 + i * 0.25, -0.2)
    growthPhases.push(phase)
    groups.growth.add(phase)
  }
  groups.growth.position.set(1.2, -0.2, -1.2)

  const marketOrbs = []
  for (let i = 0; i < 6; i += 1) {
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x9ef1ff, emissive: 0x0b2b3a })
    )
    orb.position.set(Math.cos(i) * 0.7, 0.2, Math.sin(i) * 0.7)
    marketOrbs.push(orb)
    groups.market.add(orb)
  }
  groups.market.position.set(-1.4, 0.4, -1.0)

  const investmentMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    emissive: 0x5a3b00,
    roughness: 0.3,
  })
  const investmentCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 1), investmentMaterial)
  groups.investment.add(investmentCore)
  const investmentSparks = []
  for (let i = 0; i < 10; i += 1) {
    const spark = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0x5a3b00 })
    )
    spark.position.set(Math.cos(i) * 0.7, Math.sin(i) * 0.4, -0.1)
    investmentSparks.push(spark)
    groups.investment.add(spark)
  }
  groups.investment.position.set(1.4, 0.2, -1.1)

  const teamNodes = []
  for (let i = 0; i < 8; i += 1) {
    const node = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xe6eef7 })
    )
    node.position.set(Math.cos(i) * 0.7, Math.sin(i) * 0.4, -0.2)
    teamNodes.push(node)
    groups.team.add(node)
  }
  groups.team.position.set(-1.2, 0.2, -1.1)

  Object.values(groups).forEach((group) => {
    group.visible = false
    scene.add(group)
  })

  let activeId = 'home'

  const setActive = (id) => {
    activeId = id
    Object.entries(groups).forEach(([key, group]) => {
      group.visible = key === id
    })
  }

  const updateGrowthPoints = () => {
    const positions = growthPoints.geometry.getAttribute('position')
    for (let i = 0; i < growthCount; i += 1) {
      const i3 = i * 3
      positions.array[i3 + 1] += 0.01
      if (positions.array[i3 + 1] > 1.8) {
        positions.array[i3 + 1] = 0
      }
    }
    positions.needsUpdate = true
  }

  const update = (elapsed) => {
    const pulse = 1 + Math.sin(elapsed * 1.4) * 0.05
    const activeGroup = groups[activeId]
    if (activeGroup) {
      activeGroup.scale.set(pulse, pulse, pulse)
    }

    groups.business.rotation.y = elapsed * 0.4
    groups.revenue.children.forEach((child, index) => {
      child.rotation.z = Math.sin(elapsed * 0.4 + index) * 0.3
    })
    groups.advantages.rotation.y = elapsed * 0.5
    groups.growth.rotation.y = elapsed * 0.25
    groups.market.rotation.y = elapsed * 0.3
    groups.investment.rotation.y = elapsed * 0.45
    groups.team.rotation.y = -elapsed * 0.35

    if (activeId === 'revenue') {
      const glow = 0.5 + Math.sin(elapsed * 2.0) * 0.4
      groups.revenue.children.forEach((child) => {
        if (child.material?.color) {
          child.material.color.setHSL(0.12, 0.9, 0.55 + glow * 0.2)
        }
      })
      const streamPositions = revenueStream.geometry.getAttribute('position')
      for (let i = 0; i < streamPositions.count; i += 1) {
        const y = streamPositions.getY(i) + 0.02
        streamPositions.setY(i, y > 0.6 ? -0.6 : y)
      }
      streamPositions.needsUpdate = true
    }

    if (activeId === 'market') {
      marketOrbs.forEach((orb, index) => {
        const angle = elapsed * 0.6 + index
        orb.position.x = Math.cos(angle) * 0.7
        orb.position.z = Math.sin(angle) * 0.7
      })
    }

    if (activeId === 'advantages') {
      advantageRings.forEach((ring, index) => {
        const material = ring.material
        material.emissiveIntensity = 0.2 + Math.sin(elapsed * 1.6 + index) * 0.25
      })
    }

    if (activeId === 'investment') {
      investmentMaterial.emissiveIntensity = 0.4 + Math.sin(elapsed * 1.8) * 0.3
      investmentCore.scale.set(pulse * 1.1, pulse * 1.1, pulse * 1.1)
      investmentSparks.forEach((spark, index) => {
        const angle = elapsed * 0.9 + index
        spark.position.x = Math.cos(angle) * 0.7
        spark.position.y = Math.sin(angle) * 0.4
      })
    }

    if (activeId === 'growth') {
      updateGrowthPoints()
      growthPhases.forEach((phase, index) => {
        phase.position.y = -0.2 + index * 0.25 + Math.sin(elapsed * 2 + index) * 0.08
        phase.scale.y = 1 + Math.sin(elapsed * 1.5 + index) * 0.15
      })
    }

    if (activeId === 'team') {
      teamNodes.forEach((node, index) => {
        const angle = elapsed * 0.5 + index
        const radius = 0.5 + (index % 3) * 0.15
        node.position.x = Math.cos(angle) * radius
        node.position.y = Math.sin(angle) * 0.35
      })
    }
  }

  return { groups, setActive, update }
}
